
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RotateCcw } from "lucide-react";
import { Conversation } from "@/stores/messageStore";

interface ConversationListProps {
  conversations: Conversation[];
  selectedChat: number | null;
  onSelectChat: (id: number) => void;
}

export const ConversationList = ({ conversations, selectedChat, onSelectChat }: ConversationListProps) => {
  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2 p-4">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
              selectedChat === conv.id ? 'bg-blue-50 border-blue-200 border' : 'border border-transparent'
            }`}
            onClick={() => onSelectChat(conv.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center text-white font-semibold">
                {conv.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="font-medium text-gray-900">{conv.partner}</div>
                  <div className="text-xs text-gray-500">{conv.time}</div>
                </div>
                <div className="flex items-center space-x-2 mb-2">
                  <RotateCcw className="w-3 h-3 text-gray-400" />
                  <div className="text-xs text-gray-600 truncate">{conv.item}</div>
                </div>
                <div className="text-sm text-gray-600 truncate">{conv.lastMessage}</div>
                <div className="flex items-center justify-between mt-2">
                  <Badge 
                    variant={conv.status === 'completed' ? 'default' : conv.status === 'matched' ? 'secondary' : 'outline'}
                    className="text-xs"
                  >
                    {conv.status}
                  </Badge>
                  {conv.unread > 0 && (
                    <Badge className="bg-red-500 text-white text-xs">
                      {conv.unread}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
};
