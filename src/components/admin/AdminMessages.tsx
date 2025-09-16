import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";
import { useAdminMessages } from "@/hooks/useAdminMessages";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Send, User, Clock } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface AdminMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  is_admin: boolean;
  content: string;
  created_at: string;
  is_read: boolean;
}

interface AdminConversation {
  conv_id: string;
  user_id: string;
  inquiry_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  user_name: string;
  user_email: string;
}

export const AdminMessages = () => {
  const { user } = useAuthStore();
  const { fetchAdminConversations, fetchAdminMessages, sendAdminMessage, markAdminMessagesAsRead } = useAdminMessages();
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const queryClient = useQueryClient();

  // Fetch admin conversations
  const { data: conversations = [], isLoading: conversationsLoading } = useQuery({
    queryKey: ['admin-conversations'],
    queryFn: fetchAdminConversations,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  // Fetch messages for selected conversation
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['admin-messages', selectedConversation],
    queryFn: () => selectedConversation ? fetchAdminMessages(selectedConversation) : [],
    enabled: !!selectedConversation,
    refetchInterval: 5000, // Refresh every 5 seconds for active conversation
  });

  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: async ({ conversationId, content }: { conversationId: string; content: string }) => {
      await sendAdminMessage(conversationId, content, true);
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['admin-messages', selectedConversation] });
      queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
      toast.success("Message sent successfully");
    },
    onError: (error) => {
      toast.error("Failed to send message");
      console.error('Error sending message:', error);
    },
  });

  const handleSelectConversation = async (conversationId: string) => {
    setSelectedConversation(conversationId);
    // Mark messages as read when conversation is selected
    await markAdminMessagesAsRead(conversationId);
    queryClient.invalidateQueries({ queryKey: ['admin-conversations'] });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    sendMessage.mutate({
      conversationId: selectedConversation,
      content: newMessage.trim(),
    });
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (conversationsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <MessageSquare className="w-8 h-8 animate-pulse mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading conversations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-200px)]">
      {/* Conversations List */}
      <Card className="lg:col-span-1">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Customer Conversations
            {conversations.length > 0 && (
              <Badge variant="secondary">{conversations.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                No conversations yet
              </div>
            ) : (
              <div className="space-y-1">
                {conversations.map((conversation) => (
                  <div
                    key={conversation.conv_id}
                    className={`p-4 cursor-pointer hover:bg-muted/50 border-b transition-colors ${
                      selectedConversation === conversation.conv_id ? 'bg-muted' : ''
                    }`}
                    onClick={() => handleSelectConversation(conversation.conv_id)}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="w-10 h-10">
                        <AvatarFallback>
                          {getInitials(conversation.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium truncate">{conversation.user_name}</h4>
                          {conversation.unread_count > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conversation.unread_count}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground truncate">
                          {conversation.user_email}
                        </p>
                        {conversation.last_message && (
                          <p className="text-sm text-muted-foreground truncate mt-1">
                            {conversation.last_message}
                          </p>
                        )}
                        {conversation.last_message_time && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {format(new Date(conversation.last_message_time), 'MMM d, h:mm a')}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Messages View */}
      <Card className="lg:col-span-2">
        {selectedConversation ? (
          <>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                {conversations.find(c => c.conv_id === selectedConversation)?.user_name || 'Conversation'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col h-full">
              {/* Messages */}
              <ScrollArea className="flex-1 p-4 h-[calc(100vh-400px)]">
                {messagesLoading ? (
                  <div className="flex items-center justify-center p-8">
                    <div className="text-center">
                      <MessageSquare className="w-6 h-6 animate-pulse mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Loading messages...</p>
                    </div>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="text-center p-8 text-muted-foreground">
                    No messages in this conversation yet
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message: AdminMessage) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_admin ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-lg p-3 ${
                            message.is_admin
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                          <div className="flex items-center gap-1 mt-2 text-xs opacity-70">
                            <Clock className="w-3 h-3" />
                            {format(new Date(message.created_at), 'MMM d, h:mm a')}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>

              {/* Message Input */}
              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    className="flex-1 min-h-[60px] max-h-[120px]"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || sendMessage.isPending}
                    className="self-end"
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </>
        ) : (
          <CardContent className="flex items-center justify-center h-full">
            <div className="text-center text-muted-foreground">
              <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">Select a conversation</h3>
              <p>Choose a conversation from the left to start messaging</p>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};