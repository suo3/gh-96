import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMessageStore } from "@/stores/messageStore";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, X, Star, Loader2, MessageCircle } from "lucide-react";
import { useState } from "react";
import { UserRating } from "./UserRating";
import { useAuthStore } from "@/stores/authStore";

export const ConversationManager = () => {
  const { 
    conversations, 
    markConversationComplete, 
    rejectConversation, 
    fetchConversations, 
    isLoading, 
    error 
  } = useMessageStore();
  const { user } = useAuthStore();
  const { toast } = useToast();
  const [showRating, setShowRating] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  useEffect(() => {
    console.log('ConversationManager: Fetching conversations on mount');
    fetchConversations();
  }, [fetchConversations]);

  const handleMarkComplete = (conversationId: string, partner: string, item: string) => {
    markConversationComplete(conversationId);
    toast({
      title: "Conversation Completed",
      description: `Your swap with ${partner} has been marked as complete.`,
    });
    
    // Show rating dialog immediately after marking complete
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setShowRating(true);
    }
  };

  const handleRejectSwap = async (conversationId: string, partner: string, item: string) => {
    await rejectConversation(conversationId);
    toast({
      title: "Swap Request Rejected",
      description: `You have rejected the swap request from ${partner} for "${item}".`,
      variant: "destructive"
    });
  };

  // Helper function to get the partner's user ID from the conversation
  const getPartnerUserId = (conversation: any) => {
    if (!user) return null;
    return conversation.user1_id === user.id ? conversation.user2_id : conversation.user1_id;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading conversations...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-red-600 mb-4">Error loading conversations: {error}</div>
        <Button onClick={fetchConversations} variant="outline">
          Try Again
        </Button>
      </div>
    );
  }

  // Filter conversations by status
  const activeConversations = conversations.filter(conv => 
    conv.status === 'matched' || conv.status === 'completed'
  );
  const rejectedConversations = conversations.filter(conv => 
    conv.status === 'rejected'
  );

  const renderConversationCard = (conversation: any) => (
    <Card key={conversation.id}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
              {conversation.avatar}
            </div>
            {conversation.partner}
            {conversation.isOwner && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Owner
              </Badge>
            )}
          </CardTitle>
          <Badge 
            variant={
              conversation.status === 'completed' ? 'secondary' : 
              conversation.status === 'rejected' ? 'destructive' :
              conversation.status === 'matched' ? 'default' : 'outline'
            }
          >
            {conversation.status === 'rejected' ? 'REJECTED' : conversation.status}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-2">Item swap:</p>
            <p className="font-medium">{conversation.item}</p>
          </div>
          
          <div>
            <p className="text-sm text-gray-600 mb-1">Last message:</p>
            <p className="text-sm">{conversation.lastMessage}</p>
            <p className="text-xs text-gray-400 mt-1">{conversation.time}</p>
          </div>

          {conversation.unread > 0 && (
            <Badge variant="destructive" className="text-xs">
              {conversation.unread} unread messages
            </Badge>
          )}

          {conversation.status === 'matched' && (
            <div className="flex space-x-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleMarkComplete(conversation.id, conversation.partner, conversation.item)}
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark as Complete
              </Button>
              
              {conversation.isOwner && (
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleRejectSwap(conversation.id, conversation.partner, conversation.item)}
                >
                  <X className="w-4 h-4 mr-2" />
                  Reject Swap
                </Button>
              )}
            </div>
          )}

          {conversation.status === 'completed' && (
            <div className="space-y-2">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center text-green-700">
                  <CheckCircle className="w-4 h-4 mr-2" />
                  <span className="text-sm font-medium">Swap completed successfully!</span>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedConversation(conversation);
                  setShowRating(true);
                }}
                className="w-full"
              >
                <Star className="w-4 h-4 mr-2" />
                Rate {conversation.partner}
              </Button>
            </div>
          )}

          {conversation.status === 'rejected' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center text-red-700">
                <X className="w-4 h-4 mr-2" />
                <span className="text-sm font-medium">This swap request has been rejected</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Conversations</h2>
        <Badge variant="outline">
          {conversations.length} conversations
        </Badge>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="active" className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-2" />
            Active ({activeConversations.length})
          </TabsTrigger>
          <TabsTrigger value="rejected" className="flex items-center">
            <X className="w-4 h-4 mr-2" />
            Rejected ({rejectedConversations.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="mt-6">
          {activeConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No active conversations yet</p>
              <p className="text-sm">Start swiping to begin conversations!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeConversations.map(renderConversationCard)}
            </div>
          )}
        </TabsContent>

        <TabsContent value="rejected" className="mt-6">
          {rejectedConversations.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <X className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No rejected conversations</p>
              <p className="text-sm">Rejected swap requests will appear here.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {rejectedConversations.map(renderConversationCard)}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {selectedConversation && (
        <UserRating
          open={showRating}
          onOpenChange={setShowRating}
          ratedUserId={getPartnerUserId(selectedConversation) || ""}
          ratedUserName={selectedConversation.partner}
          itemTitle={selectedConversation.item}
        />
      )}
    </div>
  );
};
