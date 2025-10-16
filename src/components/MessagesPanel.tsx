
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Send, MessageCircle, CheckCircle, Shield, Headphones } from "lucide-react";
import { ConversationList } from "./ConversationList";
import { MessageBubble } from "./MessageBubble";
import { TypingIndicator } from "./TypingIndicator";
import { MessageSearch } from "./MessageSearch";
import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { useIsMobile } from "@/hooks/use-mobile";

interface MessagesPanelProps {
  onBack: () => void;
  onLogin: () => void;
}

export const MessagesPanel = ({ onBack, onLogin }: MessagesPanelProps) => {
  const [selectedChat, setSelectedChat] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const isMobile = useIsMobile();
  
  const { 
    conversations, 
    messages, 
    fetchConversations, 
    fetchMessages, 
    sendMessage,
    isLoading,
    searchQuery,
    setSearchQuery,
    getFilteredConversations
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
    onBack();
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

  const filteredConversations = getFilteredConversations();
  const currentMessages = selectedChat ? messages[selectedChat] || [] : [];
  const selectedConversation = conversations.find(c => c.id === selectedChat);

  return (
    <div className="bg-gradient-to-br from-emerald-50 via-white to-teal-50">
      {/* Header - Mobile optimized */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-emerald-100 sticky top-16 z-40">
        <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2 md:space-x-3 min-w-0 flex-1">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={onBack}
                className="touch-target shrink-0"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="min-w-0">
                <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent truncate">
                  Messages
                </h1>
                <div className="text-xs md:text-sm text-gray-600 truncate">
                  {filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}
                  {searchQuery && ` matching "${searchQuery}"`}
                </div>
              </div>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs md:text-sm">
              {conversations.filter(c => c.unread > 0).length} unread
            </Badge>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-3 md:px-4 py-3 md:py-6">
        {isMobile ? (
          /* Mobile Layout */
          selectedChat ? (
            /* Chat View */
            <div className="flex flex-col h-[calc(100vh-180px)]">
              <Card className="flex-1 flex flex-col mobile-card">
                <CardHeader className="border-b p-3">
                  <div className="flex items-center justify-between gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setSelectedChat(null)}
                      className="mr-1 touch-target"
                    >
                      <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <CardTitle className="text-base md:text-lg flex items-center flex-1 min-w-0">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                        {selectedConversation?.avatar || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center">
                          {selectedConversation?.partner || 'Chat'}
                          {selectedConversation?.status === 'completed' && (
                            <div className="ml-2 flex items-center text-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" />
                              <span className="text-xs font-medium">Completed</span>
                            </div>
                          )}
                        </div>
                        {selectedConversation?.partnerUsername && (
                          <div className="text-sm text-gray-500">
                            @{selectedConversation.partnerUsername}
                          </div>
                        )}
                      </div>
                    </CardTitle>
                    {selectedConversation?.status === 'completed' && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                        Done
                      </Badge>
                    )}
                  </div>
                  {selectedConversation?.item && (
                    <p className="text-sm text-gray-600">
                      Item: {selectedConversation.item}
                    </p>
                  )}
                </CardHeader>
                <CardContent className="p-0 flex flex-col flex-1">
                  {/* Messages Area */}
                  <ScrollArea className="flex-1 p-3 md:p-4">
                    <div className="space-y-3 md:space-y-4">
                      {currentMessages.map((message) => (
                        <MessageBubble key={message.id} message={message} />
                      ))}
                      {selectedConversation?.status === 'completed' && (
                        <div className="flex justify-center">
                          <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center text-green-700">
                            <CheckCircle className="w-5 h-5 mr-2" />
                            <span className="text-sm font-medium">
                              This swap has been completed successfully!
                            </span>
                          </div>
                        </div>
                      )}
                      {isTyping && <TypingIndicator />}
                    </div>
                  </ScrollArea>

                  {/* Message Input - Fixed at bottom */}
                  <div className="border-t p-3 md:p-4 bg-white">
                    <div className="flex space-x-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={
                          selectedConversation?.status === 'completed'
                            ? "This swap is completed"
                            : isAuthenticated
                            ? "Type your message..."
                            : "Login to send messages"
                        }
                        className="flex-1 text-sm md:text-base"
                        disabled={!isAuthenticated || isTyping || selectedConversation?.status === 'completed'}
                      />
                      <Button
                        onClick={
                          isAuthenticated
                            ? handleSendMessage
                            : onLogin
                        }
                        disabled={!isAuthenticated || !newMessage.trim() || isTyping || selectedConversation?.status === 'completed'}
                        className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 touch-target"
                        type="button"
                        title={
                          selectedConversation?.status === 'completed' 
                            ? "This swap is completed" 
                            : !isAuthenticated 
                            ? "You need to login to send" 
                            : ""
                        }
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                    {selectedConversation?.status === 'completed' ? (
                      <div className="text-xs text-gray-500 mt-2">
                        This conversation is completed. No more messages can be sent.
                      </div>
                    ) : !isAuthenticated && (
                      <div className="text-xs text-gray-500 mt-2">
                        <span>
                          <Button
                            variant="link"
                            onClick={onLogin}
                            className="p-0 h-auto min-w-0 align-baseline text-emerald-600 font-semibold"
                          >
                            Login
                          </Button>
                          {" to send messages."}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Conversations List View */
            <Card className="mobile-card">
              <CardHeader className="pb-3 p-3 md:p-6">
                <CardTitle className="text-base md:text-lg mb-3">Conversations</CardTitle>
                <MessageSearch 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </CardHeader>
              <CardContent className="p-0">
                {filteredConversations.length > 0 ? (
                  <ConversationList
                    conversations={filteredConversations}
                    selectedChat={selectedChat}
                    onSelectChat={setSelectedChat}
                  />
                ) : searchQuery ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No conversations match your search</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try searching for different terms
                    </p>
                  </div>
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
          )
        ) : (
          /* Desktop Layout */
          <div className="grid lg:grid-cols-3 gap-4 md:gap-6 h-[700px]">
            {/* Conversations List */}
            <Card className="lg:col-span-1">
              <CardHeader className="pb-3 p-4 md:p-6">
                <CardTitle className="text-base md:text-lg mb-3">Conversations</CardTitle>
                <MessageSearch 
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </CardHeader>
              <CardContent className="p-0">
                {filteredConversations.length > 0 ? (
                  <ConversationList
                    conversations={filteredConversations}
                    selectedChat={selectedChat}
                    onSelectChat={setSelectedChat}
                  />
                ) : searchQuery ? (
                  <div className="p-8 text-center text-gray-500">
                    <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                    <p className="text-sm">No conversations match your search</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Try searching for different terms
                    </p>
                  </div>
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
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3 ${
                          selectedConversation?.isAdminConversation
                            ? 'bg-gradient-to-br from-blue-500 to-indigo-500'
                            : 'bg-gradient-to-br from-emerald-400 to-teal-400'
                        }`}>
                          {selectedConversation?.isAdminConversation ? (
                            <Headphones className="w-5 h-5" />
                          ) : (
                            selectedConversation?.avatar || 'U'
                          )}
                        </div>
                        <div>
                          <div className="flex items-center">
                            {selectedConversation?.partner || 'Chat'}
                            {selectedConversation?.isAdminConversation && (
                              <Shield className="w-5 h-5 ml-2 text-blue-600" />
                            )}
                            {selectedConversation?.status === 'completed' && (
                              <div className="ml-3 flex items-center text-green-600">
                                <CheckCircle className="w-5 h-5 mr-1" />
                                <span className="text-sm font-medium">Swap Completed</span>
                              </div>
                            )}
                          </div>
                          {selectedConversation?.partnerUsername && !selectedConversation?.isAdminConversation && (
                            <div className="text-sm text-gray-500">
                              @{selectedConversation.partnerUsername}
                            </div>
                          )}
                          {selectedConversation?.isAdminConversation && (
                            <div className="text-sm text-blue-600 font-medium">
                              Customer Support
                            </div>
                          )}
                        </div>
                      </CardTitle>
                      {selectedConversation?.status === 'completed' && (
                        <Badge variant="secondary" className="bg-green-100 text-green-800">
                          Completed
                        </Badge>
                      )}
                      {selectedConversation?.isAdminConversation && (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          Support Chat
                        </Badge>
                      )}
                    </div>
                    {selectedConversation?.item && (
                      <p className="text-sm text-gray-600">
                        Item: {selectedConversation.item}
                      </p>
                    )}
                  </CardHeader>
                  <CardContent className="p-0 flex flex-col h-[600px]">
                    {/* Messages Area */}
                    <ScrollArea className="flex-1 p-4">
                      <div className="space-y-4">
                        {currentMessages.map((message) => (
                          <MessageBubble key={message.id} message={message} />
                        ))}
                        {selectedConversation?.status === 'completed' && (
                          <div className="flex justify-center">
                            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 flex items-center text-green-700">
                              <CheckCircle className="w-5 h-5 mr-2" />
                              <span className="text-sm font-medium">
                                This swap has been completed successfully!
                              </span>
                            </div>
                          </div>
                        )}
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
                          placeholder={
                            selectedConversation?.status === 'completed'
                              ? "This swap is completed"
                              : isAuthenticated
                              ? "Type your message..."
                              : "Login to send messages"
                          }
                          className="flex-1"
                          disabled={!isAuthenticated || isTyping || selectedConversation?.status === 'completed'}
                        />
                        <Button
                          onClick={
                            isAuthenticated
                              ? handleSendMessage
                              : onLogin
                          }
                          disabled={!isAuthenticated || !newMessage.trim() || isTyping || selectedConversation?.status === 'completed'}
                          className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                          type="button"
                          title={
                            selectedConversation?.status === 'completed' 
                              ? "This swap is completed" 
                              : !isAuthenticated 
                              ? "You need to login to send" 
                              : ""
                          }
                        >
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      {selectedConversation?.status === 'completed' ? (
                        <div className="text-xs text-gray-500 mt-2">
                          This conversation is completed. No more messages can be sent.
                        </div>
                      ) : !isAuthenticated && (
                        <div className="text-xs text-gray-500 mt-2">
                          <span>
                            <Button
                              variant="link"
                              onClick={onLogin}
                              className="p-0 h-auto min-w-0 align-baseline text-emerald-600 font-semibold"
                            >
                              Login
                            </Button>
                            {" to send messages."}
                          </span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </>
              ) : (
                <CardContent className="flex items-center justify-center h-[600px] text-center">
                  <div>
                    <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Select a conversation
                    </h3>
                    <p className="text-gray-600">
                      Choose a conversation from the list to start chatting
                    </p>
                    {searchQuery && (
                      <p className="text-sm text-gray-500 mt-2">
                        {filteredConversations.length === 0 
                          ? "No conversations match your search" 
                          : "Select from filtered results"}
                      </p>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};
