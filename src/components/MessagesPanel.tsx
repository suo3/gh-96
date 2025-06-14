
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, MessageCircle } from "lucide-react";
import { ConversationList } from "./ConversationList";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";

interface MessagesPanelProps {
  onBack: () => void;
  onLogin: () => void;
}

export const MessagesPanel = ({ onBack, onLogin }: MessagesPanelProps) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  const { 
    conversations, 
    messages, 
    fetchConversations, 
    fetchMessages, 
    sendMessage,
    isLoading 
  } = useMessageStore();
  const { isAuthenticated, user } = useAuthStore();

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    if (selectedChat && isAuthenticated) {
      fetchMessages(selectedChat);
    }
  }, [selectedChat, isAuthenticated, fetchMessages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedChat || !user) return;

    setIsTyping(true);
    try {
      await sendMessage(selectedChat, newMessage.trim());
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleLoginRedirect = () => {
    // Redirect back to discover view and then open login
    onBack();
    // Small delay to ensure we're back on the discover view
    setTimeout(() => {
      onLogin();
    }, 100);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl">Messages</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-gray-600">
              You need to be logged in to access your messages and start conversations.
            </p>
            <div className="space-y-2">
              <Button 
                onClick={handleLoginRedirect}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
              >
                Login to Continue
              </Button>
              <Button 
                variant="outline" 
                onClick={onBack}
                className="w-full"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Browse
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="icon" onClick={onBack}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  Messages
                </h1>
                <div className="text-sm text-gray-600">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </div>
              </div>
            </div>
            <Badge variant="secondary">
              {conversations.filter(c => c.unread > 0).length} unread
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="text-lg">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {conversations.length > 0 ? (
                <ConversationList
                  conversations={conversations}
                  selectedChat={selectedChat}
                  onSelectChat={setSelectedChat}
                />
              ) : (
                <div className="p-8 text-center text-gray-500">
                  <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">No conversations yet</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start swiping to begin conversations!
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Chat Window */}
          <Card className="lg:col-span-2">
            {selectedChat ? (
              <>
                <CardHeader className="border-b">
                  <CardTitle className="text-lg">
                    {conversations.find(c => c.id === selectedChat)?.partner || 'Chat'}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0 flex flex-col h-[500px]">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      {isTyping && <TypingIndicator />}
                    </div>
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="Type your message..."
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || isTyping}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-[500px] text-center">
                <div>
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
