
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useMessageStore } from '@/stores/messageStore';
import { useAuthStore } from '@/stores/authStore';

export const useRealtimeMessages = () => {
  const { fetchConversations, fetchMessages, selectedConversation } = useMessageStore();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to conversations table changes
    const conversationsChannel = supabase
      .channel('conversations-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          console.log('Conversations real-time update:', payload);
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
    };
  }, [isAuthenticated, fetchConversations]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Subscribe to messages table changes
    const messagesChannel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Messages real-time update:', payload);
          // Refresh conversations to update unread counts
          fetchConversations();
          
          // If we're viewing a specific conversation, refresh its messages
          if (selectedConversation && payload.new && payload.new.conversation_id === selectedConversation) {
            fetchMessages(selectedConversation);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(messagesChannel);
    };
  }, [isAuthenticated, fetchConversations, fetchMessages, selectedConversation]);
};
