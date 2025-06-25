
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Award, Trophy, Star, Target, Zap, Heart } from "lucide-react";

interface AchievementsDisplayProps {
  achievements: string[];
  totalSwaps: number;
  rating: number;
}

const ACHIEVEMENT_CONFIG = {
  'first_swap': {
    icon: Target,
    title: 'First Swap',
    description: 'Completed your first successful swap',
    color: 'bg-blue-100 text-blue-800 border-blue-300'
  },
  'swap_master': {
    icon: Trophy,
    title: 'Swap Master',
    description: 'Completed 10+ successful swaps',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300'
  },
  'highly_rated': {
    icon: Star,
    title: 'Highly Rated',
    description: 'Maintained 4.5+ star rating',
    color: 'bg-purple-100 text-purple-800 border-purple-300'
  },
  'community_favorite': {
    icon: Heart,
    title: 'Community Favorite',
    description: 'Received 50+ positive ratings',
    color: 'bg-pink-100 text-pink-800 border-pink-300'
  },
  'speed_swapper': {
    icon: Zap,
    title: 'Speed Swapper',
    description: 'Completed 5 swaps in one week',
    color: 'bg-green-100 text-green-800 border-green-300'
  },
  'trusted_trader': {
    icon: Award,
    title: 'Trusted Trader',
    description: 'Zero reported issues in 20+ swaps',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300'
  }
};

export const AchievementsDisplay = ({ 
  achievements, 
  totalSwaps, 
  rating 
}: AchievementsDisplayProps) => {
  // Auto-calculate achievements based on user stats
  const calculatedAchievements = new Set(achievements || []);
  
  if (totalSwaps >= 1) calculatedAchievements.add('first_swap');
  if (totalSwaps >= 10) calculatedAchievements.add('swap_master');
  if (rating >= 4.5) calculatedAchievements.add('highly_rated');

  const achievementsList = Array.from(calculatedAchievements);

  if (achievementsList.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Award className="w-5 h-5 mr-2 text-yellow-500" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-gray-500">
            <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Complete your first swap to earn achievements!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="w-5 h-5 mr-2 text-yellow-500" />
          Achievements ({achievementsList.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {achievementsList.map((achievementKey) => {
            const config = ACHIEVEMENT_CONFIG[achievementKey as keyof typeof ACHIEVEMENT_CONFIG];
            if (!config) return null;

            const IconComponent = config.icon;
            
            return (
              <div
                key={achievementKey}
                className="flex items-center space-x-3 p-3 rounded-lg border bg-gray-50"
              >
                <div className="flex-shrink-0">
                  <IconComponent className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900">{config.title}</p>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
                <Badge className={config.color}>
                  Earned
                </Badge>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
