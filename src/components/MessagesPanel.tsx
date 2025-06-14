
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Send, RotateCcw, LogIn } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { MessageBubble } from "@/components/MessageBubble";
import { TypingIndicator } from "@/components/TypingIndicator";
import { ConversationList } from "@/components/ConversationList";

interface MessagesPanelProps {
  onBack: () => void;
  onLogin: () => void;
}

export const MessagesPanel = ({ onBack, onLogin }: MessagesPanelProps) => {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { isAuthenticated, session } = useAuthStore();
  
  const {
    conversations,
    messages,
    selectedConversation,
    isTyping,
    isLoading,
    setSelectedConversation,
    sendMessage,
    fetchConversations,
  } = useMessageStore();

  // Fetch conversations when component mounts and user is authenticated
  useEffect(() => {
    if (isAuthenticated && session?.user) {
      fetchConversations();
    }
  }, [isAuthenticated, session?.user, fetchConversations]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, selectedConversation, isTyping]);

  const handleSendMessage = async () => {
    if (newMessage.trim() && selectedConversation) {
      await sendMessage(selectedConversation, newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Show login prompt if user is not authenticated
  if (!isAuthenticated || !session?.user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center">
              <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-xl font-bold text-gray-900">Messages</h1>
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="h-[600px]">
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium mb-2">Login Required</h3>
                <p className="text-sm text-gray-600 mb-4">You need to be logged in to view and send messages</p>
                <Button onClick={onLogin} className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                  Login to Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);
  const conversationMessages = selectedConversation ? messages[selectedConversation] || [] : [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-green-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center">
            <Button variant="ghost" size="icon" onClick={onBack} className="mr-3">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold text-gray-900">Messages</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          {/* Conversations List */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-gray-500">Loading conversations...</div>
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex items-center justify-center h-40">
                  <div className="text-center text-gray-500">
                    <div className="text-sm">No conversations yet</div>
                    <div className="text-xs mt-1">Start swiping on items to begin chatting!</div>
                  </div>
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  selectedChat={selectedConversation}
                  onSelectChat={setSelectedConversation}
                />
              )}
            </CardContent>
          </Card>

          {/* Chat Area */}
          <Card className="lg:col-span-2">
            {selectedConversationData ? (
              <>
                <CardHeader className="border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedConversationData.avatar}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {selectedConversationData.partner}
                      </CardTitle>
                      <div className="text-sm text-gray-600 flex items-center">
                        <RotateCcw className="w-3 h-3 mr-1" />
                        {selectedConversationData.item}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="p-0 flex flex-col h-[450px]">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {conversationMessages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      {isTyping[selectedConversation!] && <TypingIndicator />}
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>
                  
                  <div className="border-t p-4">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        onKeyPress={handleKeyPress}
                        className="flex-1"
                        maxLength={500}
                      />
                      <Button 
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim()}
                        className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-xs text-gray-500 mt-2">
                      {newMessage.length}/500 characters
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex items-center justify-center h-full">
                <div className="text-center text-gray-500">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Send className="w-8 h-8 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
                  <p className="text-sm">Choose a conversation from the list to start chatting</p>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
};
