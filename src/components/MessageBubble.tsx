
import { Message } from "@/stores/messageStore";
import { useMessageStore } from "@/stores/messageStore";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = ({ message }: MessageBubbleProps) => {
  const { deleteMessage } = useMessageStore();
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    
    setIsDeleting(true);
    try {
      await deleteMessage(message.id, message.conversationId);
    } catch (error) {
      console.error('Error deleting message:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div 
      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl relative ${
        message.sender === 'me'
          ? 'bg-blue-500 text-white'
          : 'bg-gray-100 text-gray-900'
      }`}>
        <div className="text-sm break-words">{message.text}</div>
        <div className={`text-xs mt-1 flex items-center justify-between ${
          message.sender === 'me' ? 'text-blue-100' : 'text-gray-500'
        }`}>
          <span>{formatTime(message.timestamp)}</span>
          {message.sender === 'me' && (
            <span className="ml-2">
              {message.read ? '✓✓' : '✓'}
            </span>
          )}
        </div>
        
        {/* Delete button - only show for user's own messages */}
        {message.sender === 'me' && isHovered && (
          <Button
            variant="ghost"
            size="icon"
            className={`absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
              message.sender === 'me' 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-500 hover:bg-gray-600 text-white'
            }`}
            onClick={handleDelete}
            disabled={isDeleting}
            title="Delete message"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        )}
      </div>
    </div>
  );
};
