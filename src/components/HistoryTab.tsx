
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, RotateCcw, Calendar, User } from "lucide-react";
import { useMessageStore } from "@/stores/messageStore";
import { useSwapStore } from "@/stores/swapStore";
import { useAuthStore } from "@/stores/authStore";
import { useEffect } from "react";

export const HistoryTab = () => {
  const { conversations, fetchConversations } = useMessageStore();
  const { swaps, fetchUserSwaps } = useSwapStore();
  const { user } = useAuthStore();

  useEffect(() => {
    fetchConversations();
    if (user?.id) {
      fetchUserSwaps(user.id);
    }
  }, [fetchConversations, fetchUserSwaps, user?.id]);

  // Combine and sort all activities
  const allActivities = [
    ...swaps.map(swap => ({
      id: swap.id,
      type: 'swap' as const,
      title: `Swapped ${swap.item1Title} for ${swap.item2Title}`,
      description: `Completed swap with ${swap.item1UserId === user?.id ? swap.item2UserName : swap.item1UserName}`,
      date: new Date(swap.createdAt),
      status: swap.status,
      partner: swap.item1UserId === user?.id ? swap.item2UserName : swap.item1UserName
    })),
    ...conversations.map(conv => ({
      id: conv.id,
      type: 'conversation' as const,
      title: `Started conversation about "${conv.item}"`,
      description: `With ${conv.partner}`,
      date: new Date(conv.time),
      status: conv.status,
      partner: conv.partner
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime());

  const recentActivities = allActivities.slice(0, 5);
  const remainingCount = Math.max(0, allActivities.length - 5);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Calendar className="w-5 h-5 mr-2 text-blue-500" />
          Recent Activities
          {allActivities.length > 0 && (
            <Badge variant="outline" className="ml-2">
              {allActivities.length} total
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {allActivities.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No activities yet</p>
            <p className="text-sm">Start trading to see your activity history!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-start space-x-3 p-4 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex-shrink-0 mt-1">
                  {activity.type === 'swap' ? (
                    <RotateCcw className="w-5 h-5 text-green-600" />
                  ) : (
                    <MessageCircle className="w-5 h-5 text-blue-600" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 mb-1">
                    {activity.title}
                  </p>
                  <div className="flex items-center space-x-2 mb-2">
                    <User className="w-3 h-3 text-gray-400" />
                    <p className="text-sm text-gray-600">
                      {activity.description}
                    </p>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-400">
                      {activity.date.toLocaleDateString()} at {activity.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <Badge 
                      variant={
                        activity.status === 'completed' ? 'default' : 
                        activity.status === 'matched' ? 'secondary' : 
                        'outline'
                      }
                      className={
                        activity.status === 'completed' ? 'bg-green-100 text-green-800' : ''
                      }
                    >
                      {activity.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}
            
            {remainingCount > 0 && (
              <div className="text-center py-2 text-sm text-gray-500 border-t">
                and {remainingCount} more activities...
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
