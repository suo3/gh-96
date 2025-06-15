
import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useSwapStore } from "@/stores/swapStore";
import { useAuthStore } from "@/stores/authStore";
import { Award, RotateCcw, Star, Loader2 } from "lucide-react";

const iconMap = {
  Award,
  RotateCcw,
  Star
};

const colorMap = {
  emerald: 'bg-emerald-500 text-emerald-700 bg-emerald-50',
  blue: 'bg-blue-500 text-blue-700 bg-blue-50',
  yellow: 'bg-yellow-500 text-yellow-700 bg-yellow-50'
};

export const HistoryTab = () => {
  const { swaps, achievements, isLoading, fetchUserSwaps } = useSwapStore();
  const { user } = useAuthStore();

  useEffect(() => {
    if (user?.id) {
      console.log('Fetching swaps for user:', user.id);
      fetchUserSwaps(user.id);
    }
  }, [user?.id, fetchUserSwaps]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin" />
        <span className="ml-2">Loading history...</span>
      </div>
    );
  }

  const getSwapPartner = (swap: any) => {
    if (!user) return 'Unknown';
    return swap.user1_id === user.id ? 'User 2' : 'User 1';
  };

  const getUserSwapItem = (swap: any) => {
    if (!user) return swap.item1_title;
    return swap.user1_id === user.id ? swap.item1_title : swap.item2_title;
  };

  const getPartnerSwapItem = (swap: any) => {
    if (!user) return swap.item2_title;
    return swap.user1_id === user.id ? swap.item2_title : swap.item1_title;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Recent Swaps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <RotateCcw className="w-5 h-5 mr-2 text-emerald-600" />
            Recent Swaps ({swaps.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {swaps.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <RotateCcw className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No swaps yet</p>
              <p className="text-sm">Start swapping to see your history here!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {swaps.slice(0, 5).map((swap) => (
                <div key={swap.id} className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium text-gray-900">{getUserSwapItem(swap)}</div>
                    <Badge variant="secondary">
                      {new Date(swap.created_at).toLocaleDateString()}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <div className="flex items-center">
                      <RotateCcw className="w-4 h-4 mr-1" />
                      Swapped for: <span className="font-medium ml-1">{getPartnerSwapItem(swap)}</span>
                    </div>
                    <div className="mt-1">With {getSwapPartner(swap)}</div>
                    <div className="mt-1">
                      <Badge 
                        variant={swap.status === 'completed' ? 'default' : swap.status === 'pending' ? 'secondary' : 'destructive'}
                        className="text-xs"
                      >
                        {swap.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
              {swaps.length > 5 && (
                <div className="text-center text-sm text-gray-500 mt-4">
                  And {swaps.length - 5} more swaps...
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-600" />
            Achievements ({achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Award className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No achievements yet</p>
              <p className="text-sm">Complete swaps to unlock achievements!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {achievements.map((achievement) => {
                const IconComponent = iconMap[achievement.icon as keyof typeof iconMap];
                const colors = colorMap[achievement.color as keyof typeof colorMap].split(' ');
                
                return (
                  <div key={achievement.id} className={`text-center p-4 ${colors[2]} rounded-lg`}>
                    <div className={`w-12 h-12 ${colors[0]} rounded-full flex items-center justify-center mx-auto mb-2`}>
                      <IconComponent className="w-6 h-6 text-white" />
                    </div>
                    <div className={`font-semibold ${colors[1]}`}>{achievement.title}</div>
                    <div className={`text-sm ${colors[1]}`}>{achievement.description}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      Unlocked: {achievement.unlockedAt.toLocaleDateString()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
