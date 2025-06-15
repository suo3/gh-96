
import { create } from 'zustand';
import { supabase } from '@/integrations/supabase/client';
import { useAuthStore } from './authStore';

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
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  item: string;
  status: 'matched' | 'pending' | 'completed' | 'rejected';
  isTyping?: boolean;
  isOwner?: boolean;
}

interface MessageStore {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  selectedConversation: string | null;
  isTyping: Record<string, boolean>;
  isLoading: boolean;
  totalUnreadCount: number;
  error: string | null;
  itemsWithActiveMessages: Set<string>; // Track items that have conversations
  
  setSelectedConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  addConversation: (conversation: Conversation) => void;
  createConversationFromSwipe: (listingId: string, itemTitle: string, listingOwnerId: string) => Promise<string>;
  markConversationComplete: (conversationId: string) => void;
  rejectConversation: (conversationId: string) => Promise<void>;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  hasActiveMessageForItem: (itemTitle: string, ownerId: string) => boolean;
  checkExistingConversation: (itemTitle: string, ownerId: string) => Promise<boolean>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  messages: {},
  selectedConversation: null,
  isTyping: {},
  isLoading: false,
  totalUnreadCount: 0,
  error: null,
  itemsWithActiveMessages: new Set(),
  
  setSelectedConversation: (id) => {
    set({ selectedConversation: id });
    if (id) {
      get().markAsRead(id);
      get().fetchMessages(id);
    }
  },
  
  sendMessage: async (conversationId, text) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Insert message into database
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

      // Refresh messages and conversations to get latest state
      get().fetchMessages(conversationId);
      get().fetchConversations();

    } catch (error) {
      console.error('Error sending message:', error);
    }
  },
  
  markAsRead: async (conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) return;

    const conversation = get().conversations.find(c => c.id === conversationId);
    if (!conversation || conversation.unread === 0) return;

    const unreadToClear = conversation.unread;

    // Optimistic update
    set(state => ({
      conversations: state.conversations.map(c =>
        c.id === conversationId ? { ...c, unread: 0 } : c
      ),
      totalUnreadCount: Math.max(0, state.totalUnreadCount - unreadToClear),
    }));

    const { error } = await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('conversation_id', conversationId)
      .eq('is_read', false)
      .neq('sender_id', session.user.id);
    
    if (error) {
      console.error('Error marking messages as read', error);
      // Revert on error
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

  hasActiveMessageForItem: (itemTitle: string, ownerId: string) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) return false;

    // Check if there's already a conversation for this item between current user and owner
    const conversations = get().conversations;
    return conversations.some(conv => 
      conv.item === itemTitle && 
      // The conversation involves both the current user and the item owner
      (conv.isOwner ? session.user.id !== ownerId : session.user.id === ownerId)
    );
  },

  checkExistingConversation: async (itemTitle: string, ownerId: string) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) return false;

    try {
      const { data, error } = await supabase
        .from('conversations')
        .select('id')
        .eq('item_title', itemTitle)
        .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${ownerId}),and(user1_id.eq.${ownerId},user2_id.eq.${session.user.id})`)
        .maybeSingle();

      if (error) {
        console.error('Error checking existing conversation:', error);
        return false;
      }

      return !!data;
    } catch (error) {
      console.error('Error checking existing conversation:', error);
      return false;
    }
  },

  createConversationFromSwipe: async (listingId, itemTitle, listingOwnerId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return '';
    }

    try {
      console.log('Creating conversation for listing:', { listingId, itemTitle, listingOwnerId });
      
      // First, immediately add to active messages set to prevent race condition
      const key = `${itemTitle}-${listingOwnerId}`;
      set(state => ({
        itemsWithActiveMessages: new Set([...state.itemsWithActiveMessages, key])
      }));
      
      // Check if conversation already exists between these users for this item
      const { data: existingConversation, error: checkError } = await supabase
        .from('conversations')
        .select('id')
        .eq('item_title', itemTitle)
        .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${listingOwnerId}),and(user1_id.eq.${listingOwnerId},user2_id.eq.${session.user.id})`)
        .maybeSingle();

      if (checkError) {
        console.error('Error checking existing conversation:', checkError);
      }

      if (existingConversation) {
        console.log('Conversation already exists:', existingConversation.id);
        return existingConversation.id;
      }
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: session.user.id,
          user2_id: listingOwnerId,
          item_title: itemTitle
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        // Remove from set if creation failed
        set(state => {
          const newSet = new Set(state.itemsWithActiveMessages);
          newSet.delete(key);
          return { itemsWithActiveMessages: newSet };
        });
        return '';
      }

      console.log('Conversation created:', data);

      // Add initial message
      await supabase
        .from('messages')
        .insert({
          conversation_id: data.id,
          sender_id: session.user.id,
          content: `Hi! I'm interested in your ${itemTitle}.`
        });

      // Refresh conversations but preserve the active messages set
      const currentActiveMessages = get().itemsWithActiveMessages;
      await get().fetchConversations();
      
      // Ensure our newly created conversation is still marked as active
      set(state => ({
        itemsWithActiveMessages: new Set([...state.itemsWithActiveMessages, key])
      }));
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
      // Remove from set if creation failed
      const key = `${itemTitle}-${listingOwnerId}`;
      set(state => {
        const newSet = new Set(state.itemsWithActiveMessages);
        newSet.delete(key);
        return { itemsWithActiveMessages: newSet };
      });
      return '';
    }
  },

  markConversationComplete: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(conv =>
        conv.id === conversationId
          ? { ...conv, status: 'completed', lastMessage: 'Swap completed successfully!' }
          : conv
      )
    }));
  },

  rejectConversation: async (conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      // Update conversation status in database if needed
      // For now, we'll just update local state
      set((state) => ({
        conversations: state.conversations.map(conv =>
          conv.id === conversationId
            ? { ...conv, status: 'rejected', lastMessage: 'Swap request rejected' }
            : conv
        )
      }));

      // Add rejection message
      await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: session.user.id,
          content: 'I have declined this swap request.'
        });

      // Refresh conversations
      get().fetchConversations();
    } catch (error) {
      console.error('Error rejecting conversation:', error);
    }
  },

  fetchConversations: async () => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.log('No authenticated user, clearing conversations');
      set({ conversations: [], isLoading: false, totalUnreadCount: 0, error: null, itemsWithActiveMessages: new Set() });
      return;
    }

    set({ isLoading: true, error: null });
    
    try {
      console.log('Fetching conversations for user:', session.user.id);
      
      const { data, error } = await supabase.rpc('get_conversations_with_unread');

      if (error) {
        console.error('Error fetching conversations:', error);
        set({ isLoading: false, error: error.message });
        return;
      }
      
      console.log('Fetched conversations data:', data);

      if (!data || data.length === 0) {
        console.log('No conversations found');
        set({ conversations: [], isLoading: false, totalUnreadCount: 0, error: null, itemsWithActiveMessages: new Set() });
        return;
      }

      // Get all unique partner IDs
      const partnerIds = data.map(conv => {
        return conv.user1_id === session.user.id ? conv.user2_id : conv.user1_id;
      }).filter(Boolean);

      // Fetch profiles for all partners
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, username, avatar')
        .in('id', partnerIds);

      if (profilesError) {
        console.error('Error fetching partner profiles:', profilesError);
      }

      console.log('Fetched partner profiles:', profiles);

      let totalUnread = 0;
      const activeMessageKeys = new Set<string>();

      // Transform database conversations to UI format
      const conversations: Conversation[] = data.map(conv => {
        const partnerId = conv.user1_id === session.user.id ? conv.user2_id : conv.user1_id;
        const isOwner = conv.user2_id === session.user.id; // Item owner is user2
        
        // Add to active messages set
        const key = `${conv.item_title}-${conv.user2_id}`;
        activeMessageKeys.add(key);
        
        // Find partner profile
        const partnerProfile = profiles?.find(p => p.id === partnerId);
        const partnerName = partnerProfile 
          ? `${partnerProfile.first_name || ''} ${partnerProfile.last_name || ''}`.trim() || partnerProfile.username || 'User'
          : 'Unknown User';
        
        const partnerAvatar = partnerProfile?.avatar || 
          (partnerProfile?.first_name ? partnerProfile.first_name.charAt(0).toUpperCase() : 
           partnerProfile?.username ? partnerProfile.username.charAt(0).toUpperCase() : 'U');
        
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
          partner: partnerName,
          avatar: partnerAvatar,
          lastMessage: conv.last_message || 'No messages yet.',
          time: timeDisplay,
          unread: unreadCount,
          item: conv.item_title || 'Unknown Item',
          status: 'matched' as const,
          isOwner
        };
      });

      console.log('Processed conversations:', conversations);
      
      // Preserve any existing active message keys that might not be in the fetched data yet
      const currentActiveMessages = get().itemsWithActiveMessages;
      const mergedActiveMessages = new Set([...activeMessageKeys, ...currentActiveMessages]);
      
      set({ 
        conversations, 
        isLoading: false, 
        totalUnreadCount: totalUnread, 
        error: null,
        itemsWithActiveMessages: mergedActiveMessages
      });
      
    } catch (error) {
      console.error('Error in fetchConversations:', error);
      set({ isLoading: false, error: error instanceof Error ? error.message : 'Unknown error' });
    }
  },

  fetchMessages: async (conversationId) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching messages:', error);
        return;
      }

      // Transform database messages to UI format
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

    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  }
}));
