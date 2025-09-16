
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';
import { useAdminMessages } from '@/hooks/useAdminMessages';

export interface Message {
  id: string;
  conversationId: string;
  sender: 'me' | 'partner';
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: string;
  partner: string;
  partnerUsername: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  item: string;
  status: 'matched' | 'pending' | 'completed' | 'rejected';
  isTyping?: boolean;
  isOwner?: boolean;
  listingId?: string;
  isAdminConversation?: boolean;
  inquiryId?: string;
}

interface MessageStore {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  selectedConversation: string | null;
  isTyping: Record<string, boolean>;
  isLoading: boolean;
  totalUnreadCount: number;
  error: string | null;
  searchQuery: string;
  
  setSelectedConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  deleteMessage: (messageId: string, conversationId: string) => Promise<void>;
  deleteConversation: (conversationId: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  addConversation: (conversation: Conversation) => void;
  
  markConversationComplete: (conversationId: string) => Promise<void>;
  rejectConversation: (conversationId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  checkListingHasActiveConversation: (listingId: string) => Promise<boolean>;
  setSearchQuery: (query: string) => void;
  getFilteredConversations: () => Conversation[];
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  messages: {},
  selectedConversation: null,
  isTyping: {},
  isLoading: false,
  totalUnreadCount: 0,
  error: null,
  searchQuery: '',
  
  setSelectedConversation: (id) => {
    set({ selectedConversation: id });
    if (id) {
      get().markAsRead(id);
      get().fetchMessages(id);
    }
  },
  
  sendMessage: async (conversationId, text) => {
    const { session } = useAuthStore.getState();
    const { conversations } = get();
    
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const selectedConv = conversations.find(c => c.id === conversationId);
      
      if (selectedConv?.isAdminConversation) {
        // Send admin message
        const { error } = await supabase
          .from('admin_messages')
          .insert({
            conversation_id: conversationId,
            sender_id: session.user.id,
            is_admin: false,
            content: text,
          });

        if (error) {
          console.error('Error sending admin message:', error);
          return;
        }
      } else {
        // Send regular message
        const { error } = await supabase
          .from('messages')
          .insert({
            conversation_id: conversationId,
            sender_id: session.user.id,
            content: text
          });

        if (error) {
          console.error('Error sending message:', error);
          return;
        }
      }

      get().fetchMessages(conversationId);
      get().fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
    }
  },
  
  deleteMessage: async (messageId, conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      console.log('Attempting to delete message:', messageId);
      
      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) {
        console.error('Error deleting message:', error);
        return;
      }

      console.log('Message deleted successfully:', messageId);
      get().fetchMessages(conversationId);
      get().fetchConversations();

    } catch (error) {
      console.error('Error deleting message:', error);
    }
  },
  
  deleteConversation: async (conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      console.log('Attempting to delete conversation:', conversationId);
      
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('conversation_id', conversationId);

      if (messagesError) {
        console.error('Error deleting messages:', messagesError);
        return;
      }

      console.log('Messages deleted successfully for conversation:', conversationId);

      const { error: conversationError } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (conversationError) {
        console.error('Error deleting conversation:', conversationError);
        return;
      }

      console.log('Conversation deleted successfully:', conversationId);

      set(state => {
        const updatedConversations = state.conversations.filter(c => c.id !== conversationId);
        const updatedMessages = { ...state.messages };
        delete updatedMessages[conversationId];
        
        return {
          conversations: updatedConversations,
          messages: updatedMessages,
          selectedConversation: state.selectedConversation === conversationId ? null : state.selectedConversation
        };
      });

    } catch (error) {
      console.error('Error deleting conversation:', error);
    }
  },
  
  markAsRead: async (conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) return;

    const conversation = get().conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.unread === 0) return;

    const unreadToClear = conversation.unread;

    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
      totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadToClear),
    }));

    let error = null as any;

    if (conversation.isAdminConversation) {
      const { error: adminErr } = await supabase
        .from('admin_messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', session.user.id);
      error = adminErr;
    } else {
      const { error: regularErr } = await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .eq('is_read', false)
        .neq('sender_id', session.user.id);
      error = regularErr;
    }
    
    if (error) {
      console.error('Error marking messages as read', error);
      set(state => ({
        conversations: state.conversations.map(c =>
          c.id === conversationId ? { ...c, unread: conversation.unread } : c
        ),
        totalUnreadCount: state.totalUnreadCount + unreadToClear,
      }));
    }
  },
  
  setTyping: (conversationId, isTyping) => {
    set((state) => ({
      isTyping: { ...state.isTyping, [conversationId]: isTyping }
    }));
  },
  
  addConversation: (conversation) => {
    set((state) => ({
      conversations: [conversation, ...state.conversations]
    }));
  },


  markConversationComplete: async (conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: 'This swap has been marked as complete!'
        });

      if (messageError) {
        console.error('Error adding completion message:', messageError);
      }

      set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, status: 'completed', lastMessage: 'This swap has been marked as complete!' }
            : conv
        )
      }));

      console.log('Conversation marked as complete:', conversationId);
    } catch (error) {
      console.error('Error marking conversation complete:', error);
    }
  },

  rejectConversation: async (conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: 'I have declined this swap request.'
        });

      set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, status: 'rejected', lastMessage: 'Swap request rejected' }
            : conv
        )
      }));

    } catch (error) {
      console.error('Error rejecting conversation:', error);
    }
  },

  fetchConversations: async () => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.log('No authenticated user, clearing conversations');
      set({ conversations: [], isLoading: false, totalUnreadCount: 0, error: null });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching conversations for user:', session.user.id);
      
      // Fetch regular conversations
      const { data: regularData, error: regularError } = await supabase.rpc('get_conversations_with_profiles');

      if (regularError) {
        console.error('Error fetching regular conversations:', regularError);
        set({ isLoading: false, error: regularError.message });
        return;
      }
      
      // Fetch admin conversations
      const { data: adminData, error: adminError } = await supabase.rpc('get_admin_conversations_with_latest');
      
      console.log('Fetched regular conversations data:', regularData);
      console.log('Fetched admin conversations data:', adminData);

      let totalUnread = 0;
      let allConversations: Conversation[] = [];

      // Process admin conversations first (they appear at top)
      let adminConversations: Conversation[] = [];
      if (adminData && !adminError && adminData.length > 0) {
        adminConversations = adminData.map((conv: any) => {
          let timeDisplay = new Date(conv.created_at).toLocaleDateString();
          if (conv.last_message_time) {
            const messageDate = new Date(conv.last_message_time);
            const today = new Date();
            if (messageDate.toDateString() === today.toDateString()) {
              timeDisplay = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
              timeDisplay = messageDate.toLocaleDateString();
            }
          }
          
          const unreadCount = Number(conv.unread_count) || 0;
          totalUnread += unreadCount;
          
          return {
            id: conv.conv_id,
            partner: 'Support Team',
            partnerUsername: 'support',
            avatar: '🛠️',
            lastMessage: conv.last_message || 'No messages yet.',
            time: timeDisplay,
            unread: unreadCount,
            item: 'Support Inquiry',
            status: 'matched' as const,
            isAdminConversation: true,
            inquiryId: conv.inquiry_id,
          };
        });
        allConversations = [...adminConversations];
      } else {
        // Fallback: build admin conversations directly if RPC unavailable or empty
        const { data: adminConvs, error: convsErr } = await supabase
          .from('admin_conversations')
          .select('id, inquiry_id, created_at, updated_at')
          .eq('user_id', session.user.id)
          .order('updated_at', { ascending: false });

        if (convsErr) {
          console.error('Error fetching admin conversations (fallback):', convsErr);
        } else if (adminConvs && adminConvs.length > 0) {
          const convIds = adminConvs.map((c: any) => c.id);
          const { data: adminMsgs, error: msgsErr } = await supabase
            .from('admin_messages')
            .select('id, conversation_id, sender_id, content, created_at, is_read')
            .in('conversation_id', convIds)
            .order('created_at', { ascending: true });

          if (msgsErr) {
            console.error('Error fetching admin messages (fallback):', msgsErr);
          } else {
            const grouped: Record<string, any[]> = {};
            (adminMsgs || []).forEach((m: any) => {
              if (!grouped[m.conversation_id]) grouped[m.conversation_id] = [];
              grouped[m.conversation_id].push(m);
            });

            adminConversations = adminConvs.map((conv: any) => {
              const msgs = grouped[conv.id] || [];
              const lastMsg = msgs.length ? msgs[msgs.length - 1] : null;

              let timeDisplay = new Date(conv.updated_at || conv.created_at).toLocaleDateString();
              if (lastMsg) {
                const messageDate = new Date(lastMsg.created_at);
                const today = new Date();
                timeDisplay = messageDate.toDateString() === today.toDateString()
                  ? messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                  : messageDate.toLocaleDateString();
              }

              const unreadCount = msgs.filter((m: any) => !m.is_read && m.sender_id !== session.user.id).length;
              totalUnread += unreadCount;

              return {
                id: conv.id,
                partner: 'Support Team',
                partnerUsername: 'support',
                avatar: '🛠️',
                lastMessage: lastMsg?.content || 'No messages yet.',
                time: timeDisplay,
                unread: unreadCount,
                item: 'Support Inquiry',
                status: 'matched' as const,
                isAdminConversation: true,
                inquiryId: conv.inquiry_id,
              };
            });
            allConversations = [...adminConversations];
          }
        }
      }

      // Process regular conversations
      if (regularData && regularData.length > 0) {
        const regularConversations: Conversation[] = regularData.map(conv => {
          const isOwner = conv.user2_id === session.user.id;
          
          let timeDisplay = new Date(conv.created_at).toLocaleDateString();
          if (conv.last_message_time) {
            const messageDate = new Date(conv.last_message_time);
            const today = new Date();
            if (messageDate.toDateString() === today.toDateString()) {
              timeDisplay = messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            } else {
              timeDisplay = messageDate.toLocaleDateString();
            }
          }
          
          const unreadCount = Number(conv.unread_count) || 0;
          totalUnread += unreadCount;
          
          return {
            id: conv.conv_id,
            partner: conv.partner_name || 'Unknown User',
            partnerUsername: conv.partner_username || '',
            avatar: conv.partner_avatar || 'U',
            lastMessage: conv.last_message || 'No messages yet.',
            time: timeDisplay,
            unread: unreadCount,
            item: conv.item_title || 'Unknown Item',
            status: 'matched' as const,
            isOwner,
            listingId: (conv as any).listing_id,
            isAdminConversation: false,
          };
        });
        allConversations = [...allConversations, ...regularConversations];
      }

      console.log('Processed all conversations:', allConversations);
      set({ conversations: allConversations, isLoading: false, totalUnreadCount: totalUnread, error: null });
      
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  fetchMessages: async (conversationId) => {
    const { session } = useAuthStore.getState();
    const { conversations } = get();
    
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const selectedConv = conversations.find(c => c.id === conversationId);
      
      if (selectedConv?.isAdminConversation) {
        // Fetch admin messages
        const { data, error } = await supabase
          .from('admin_messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching admin messages:', error);
          return;
        }

        const messages: Message[] = data.map(msg => ({
          id: msg.id,
          conversationId: msg.conversation_id,
          sender: msg.sender_id === session.user.id ? 'me' : 'partner',
          text: msg.content,
          timestamp: new Date(msg.created_at),
          read: msg.is_read,
        }));

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: messages
          }
        }));
      } else {
        // Fetch regular messages
        const { data, error } = await supabase
          .from('messages')
          .select('*')
          .eq('conversation_id', conversationId)
          .order('created_at', { ascending: true });

        if (error) {
          console.error('Error fetching messages:', error);
          return;
        }

        const messages: Message[] = data.map(msg => ({
          id: msg.id,
          conversationId: msg.conversation_id,
          sender: msg.sender_id === session.user.id ? 'me' : 'partner',
          text: msg.content,
          timestamp: new Date(msg.created_at),
          read: msg.is_read,
        }));

        set((state) => ({
          messages: {
            ...state.messages,
            [conversationId]: messages
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  },

  checkListingHasActiveConversation: async (listingId) => {
    try {
      const { data, error } = await supabase
        .rpc('listing_has_active_conversation', { listing_uuid: listingId });

      if (error) {
        console.error('Error checking listing conversation:', error);
        return false;
      }

      return data || false;
    } catch (error) {
      console.error('Error in checkListingHasActiveConversation:', error);
      return false;
    }
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  getFilteredConversations: () => {
    const { conversations, searchQuery } = get();
    if (!searchQuery.trim()) return conversations;
    
    const query = searchQuery.toLowerCase();
    return conversations.filter(conv => 
      conv.partner.toLowerCase().includes(query) ||
      conv.item.toLowerCase().includes(query) ||
      conv.lastMessage.toLowerCase().includes(query)
    );
  }
}));
