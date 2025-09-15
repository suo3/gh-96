import { useMessageStore } from "@/stores/messageStore";
import { useAuthStore } from "@/stores/authStore";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

interface AdminConversation {
  conv_id: string;
  user_id: string;
  inquiry_id?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  last_message?: string;
  last_message_time?: string;
  unread_count: number;
  user_name: string;
  user_email: string;
}

interface AdminMessage {
  id: string;
  conversation_id: string;
  sender_id: string;
  is_admin: boolean;
  content: string;
  created_at: string;
  is_read: boolean;
}

export const useAdminMessages = () => {
  const { user } = useAuthStore();

  const fetchAdminConversations = async (): Promise<AdminConversation[]> => {
    if (!user) return [];

    const { data, error } = await supabase
      .rpc('get_admin_conversations_with_latest');

    if (error) {
      console.error('Error fetching admin conversations:', error);
      return [];
    }

    return data || [];
  };

  const fetchAdminMessages = async (conversationId: string): Promise<AdminMessage[]> => {
    if (!conversationId) return [];

    const { data, error } = await supabase
      .from('admin_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching admin messages:', error);
      return [];
    }

    return data || [];
  };

  const sendAdminMessage = async (conversationId: string, content: string, isAdmin: boolean = false) => {
    if (!user || !content.trim()) return;

    const { error } = await supabase
      .from('admin_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        is_admin: isAdmin,
        content: content.trim(),
      });

    if (error) {
      console.error('Error sending admin message:', error);
      throw error;
    }
  };

  const markAdminMessagesAsRead = async (conversationId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('admin_messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    if (error) {
      console.error('Error marking admin messages as read:', error);
    }
  };

  return {
    fetchAdminConversations,
    fetchAdminMessages,
    sendAdminMessage,
    markAdminMessagesAsRead,
  };
};