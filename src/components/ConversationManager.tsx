
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useMessageStore } from "@/stores/messageStore";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, Star } from "lucide-react";
import { useState } from "react";
import { UserRating } from "./UserRating";

export const ConversationManager = () => {
  const { conversations, markConversationComplete } = useMessageStore();
  const { toast } = useToast();
  const [showRating, setShowRating] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<any>(null);

  const handleMarkComplete = (conversationId: number, partner: string, item: string) => {
    markConversationComplete(conversationId);
    toast({
      title: "Conversation Completed",
      description: `Your swap with ${partner} has been marked as complete.`,
    });
    
    // Show rating dialog
    const conversation = conversations.find(c => c.id === conversationId);
    if (conversation) {
      setSelectedConversation(conversation);
      setShowRating(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Conversations</h2>
        <Badge variant="outline">
          {conversations.length} conversations
        </Badge>
      </div>

      <div className="space-y-4">
        {conversations.map((conversation) => (
          <Card key={conversation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white text-sm font-bold mr-3">
                    {conversation.avatar}
                  </div>
                  {conversation.partner}
                </CardTitle>
                <Badge 
                  variant={
                    conversation.status === 'completed' ? 'secondary' : 
                    conversation.status === 'matched' ? 'default' : 'outline'
                  }
                >
                  {conversation.status}
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
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedConversation && (
        <UserRating
          open={showRating}
          onOpenChange={setShowRating}
          ratedUserId="dummy-user-id"
          ratedUserName={selectedConversation.partner}
          itemTitle={selectedConversation.item}
        />
      )}
    </div>
  );
};
