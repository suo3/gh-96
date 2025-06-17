
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2 } from "lucide-react";
import { Conversation } from "@/stores/messageStore";
import { useMessageStore } from "@/stores/messageStore";
import { useState } from "react";

interface ConversationListProps {
  conversations: Conversation[];
  selectedChat: string | null;
  onSelectChat: (id: string) => void;
}

export const ConversationList = ({ conversations, selectedChat, onSelectChat }: ConversationListProps) => {
  const { deleteConversation } = useMessageStore();
  const [deletingConversations, setDeletingConversations] = useState<Set<string>>(new Set());

  const handleDeleteConversation = async (conversationId: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent conversation selection when clicking delete
    
    if (deletingConversations.has(conversationId)) return;
    
    setDeletingConversations(prev => new Set([...prev, conversationId]));
    
    try {
      await deleteConversation(conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
    } finally {
      setDeletingConversations(prev => {
        const newSet = new Set(prev);
        newSet.delete(conversationId);
        return newSet;
      });
    }
  };

  return (
    <ScrollArea className="h-[500px]">
      <div className="space-y-2 p-4">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`p-4 rounded-lg cursor-pointer transition-colors hover:bg-gray-50 group relative ${
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
                  <div className="flex items-center space-x-2">
                    <div className="text-xs text-gray-500">{conv.time}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity bg-red-500 hover:bg-red-600 text-white"
                      onClick={(e) => handleDeleteConversation(conv.id, e)}
                      disabled={deletingConversations.has(conv.id)}
                      title="Delete conversation"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
