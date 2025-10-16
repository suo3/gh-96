
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { RotateCcw, Trash2, User, Shield, Headphones } from "lucide-react";
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
    e.stopPropagation();
    
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
    <ScrollArea className="h-[60vh] md:h-[600px]">
      <div className="space-y-2 p-4">
         {conversations.map((conv) => (
          <div
            key={conv.id}
            className={`p-4 rounded-lg cursor-pointer transition-all duration-200 hover:bg-gray-50 hover:shadow-sm group relative ${
              conv.isAdminConversation
                ? selectedChat === conv.id 
                  ? 'bg-blue-50 border-blue-200 border shadow-sm ring-2 ring-blue-100' 
                  : 'bg-blue-25 border-blue-100 border hover:bg-blue-50 hover:border-blue-200'
                : selectedChat === conv.id 
                  ? 'bg-emerald-50 border-emerald-200 border shadow-sm' 
                  : 'border border-transparent hover:border-gray-200'
            }`}
            onClick={() => onSelectChat(conv.id)}
          >
            <div className="flex items-start space-x-3">
              <div className="relative">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-sm ${
                  conv.isAdminConversation 
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500' 
                    : 'bg-gradient-to-br from-emerald-400 to-teal-400'
                }`}>
                  {conv.isAdminConversation ? <Headphones className="w-6 h-6" /> : conv.avatar}
                </div>
                {conv.unread > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <span className="text-xs text-white font-medium">
                      {conv.unread > 9 ? '9+' : conv.unread}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <div className="font-semibold text-gray-900 truncate flex items-center space-x-2">
                      <span>{conv.partner}</span>
                      {conv.isAdminConversation && (
                        <Shield className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    {conv.partnerUsername && !conv.isAdminConversation && (
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        @{conv.partnerUsername}
                      </div>
                    )}
                    {conv.isAdminConversation && (
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800 border-blue-200">
                        Support
                      </Badge>
                    )}
                  </div>
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
                  {conv.isAdminConversation ? (
                    <Headphones className="w-3 h-3 text-blue-500" />
                  ) : (
                    <RotateCcw className="w-3 h-3 text-gray-400" />
                  )}
                  <div className={`text-xs truncate font-medium ${
                    conv.isAdminConversation ? 'text-blue-600' : 'text-gray-600'
                  }`}>
                    {conv.item}
                  </div>
                </div>
                <div className="text-sm text-gray-600 truncate mb-2">{conv.lastMessage}</div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={conv.status === 'completed' ? 'default' : conv.status === 'matched' ? 'secondary' : 'outline'}
                      className={`text-xs ${
                        conv.status === 'completed' ? 'bg-green-100 text-green-800' : ''
                      }`}
                    >
                      {conv.status}
                    </Badge>
                    {conv.isOwner && (
                      <Badge variant="outline" className="text-xs">
                        <User className="w-3 h-3 mr-1" />
                        Owner
                      </Badge>
                    )}
                  </div>
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
