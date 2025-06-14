
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
  status: 'matched' | 'pending' | 'completed';
  isTyping?: boolean;
}

interface MessageStore {
  conversations: Conversation[];
  messages: Record<string, Message[]>;
  selectedConversation: string | null;
  isTyping: Record<string, boolean>;
  isLoading: boolean;
  
  setSelectedConversation: (id: string | null) => void;
  sendMessage: (conversationId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  addConversation: (conversation: Conversation) => void;
  createConversationFromSwipe: (itemTitle: string, partnerName: string) => Promise<string>;
  markConversationComplete: (conversationId: string) => void;
  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [],
  messages: {},
  selectedConversation: null,
  isTyping: {},
  isLoading: false,
  
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

      // Refresh messages for this conversation
      get().fetchMessages(conversationId);
      
      // Update conversation's last message
      set((state) => ({
        conversations: state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: text, time: "now" }
            : conv
        )
      }));

    } catch (error) {
      console.error('Error sending message:', error);
    }
  },
  
  markAsRead: (conversationId) => {
    set((state) => ({
      conversations: state.conversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread: 0 }
          : conv
      )
    }));
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

  createConversationFromSwipe: async (itemTitle, partnerName) => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return '';
    }

    try {
      // For now, create a mock partner ID - in real app this would come from the item listing
      const mockPartnerId = 'mock-partner-id';
      
      const { data, error } = await supabase
        .from('conversations')
        .insert({
          user1_id: session.user.id,
          user2_id: mockPartnerId,
          item_title: itemTitle
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating conversation:', error);
        return '';
      }

      // Add initial message
      await supabase
        .from('messages')
        .insert({
          conversation_id: data.id,
          sender_id: session.user.id,
          content: `Hi! I'm interested in your ${itemTitle}.`
        });

      // Refresh conversations
      get().fetchConversations();
      
      return data.id;
    } catch (error) {
      console.error('Error creating conversation:', error);
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

  fetchConversations: async () => {
    const { session } = useAuthStore.getState();
    if (!session?.user) {
      console.error('User not authenticated');
      return;
    }

    set({ isLoading: true });
    
    try {
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          id,
          item_title,
          created_at,
          user1_id,
          user2_id
        `)
        .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching conversations:', error);
        return;
      }

      // Transform database conversations to UI format
      const conversations: Conversation[] = data.map(conv => {
        const partnerId = conv.user1_id === session.user.id ? conv.user2_id : conv.user1_id;
        return {
          id: conv.id,
          partner: 'Unknown User', // In real app, fetch from profiles
          avatar: 'U',
          lastMessage: 'No messages yet',
          time: new Date(conv.created_at).toLocaleDateString(),
          unread: 0,
          item: conv.item_title || 'Unknown Item',
          status: 'matched' as const
        };
      });

      set({ conversations, isLoading: false });
      
    } catch (error) {
      console.error('Error fetching conversations:', error);
      set({ isLoading: false });
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
        read: true
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
