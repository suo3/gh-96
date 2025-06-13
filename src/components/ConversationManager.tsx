
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";

export const ConversationManager = () => {
  const { user } = useAuthStore();
  const [conversations, setConversations] = useState<any[]>([]);

  // Mock conversations for demo purposes
  useEffect(() => {
    if (user) {
      setConversations([
        {
          id: '1',
          otherUser: { name: 'Sarah M.', avatar: 'S' },
          itemTitle: 'Vintage Coffee Maker',
          lastMessage: 'Is this still available?',
          timestamp: '2 hours ago',
          unread: true
        },
        {
          id: '2',
          otherUser: { name: 'Mike K.', avatar: 'M' },
          itemTitle: 'Programming Books',
          lastMessage: 'Thanks for the trade!',
          timestamp: '1 day ago',
          unread: false
        }
      ]);
    }
  }, [user]);

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">My Conversations</h2>
        <Badge variant="outline">
          {conversations.length} active
        </Badge>
      </div>

      {conversations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No conversations yet.</p>
            <p className="text-sm text-gray-400 mt-2">
              Start by messaging someone about their listing!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {conversations.map((conversation) => (
            <Card key={conversation.id} className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-4">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-400 rounded-full flex items-center justify-center text-white font-bold">
                    {conversation.otherUser.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900">
                        {conversation.otherUser.name}
                      </h3>
                      <span className="text-xs text-gray-500">
                        {conversation.timestamp}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      Re: {conversation.itemTitle}
                    </p>
                    <p className="text-sm text-gray-800 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  {conversation.unread && (
                    <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
