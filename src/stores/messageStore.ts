import { create } from 'zustand';

export interface Message {
  id: string;
  conversationId: number;
  sender: 'me' | 'partner';
  text: string;
  timestamp: Date;
  read: boolean;
}

export interface Conversation {
  id: number;
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
  messages: Record<number, Message[]>;
  selectedConversation: number | null;
  isTyping: Record<number, boolean>;
  
  setSelectedConversation: (id: number | null) => void;
  sendMessage: (conversationId: number, text: string) => void;
  markAsRead: (conversationId: number) => void;
  setTyping: (conversationId: number, isTyping: boolean) => void;
  addConversation: (conversation: Conversation) => void;
  createConversationFromSwipe: (itemTitle: string, partnerName: string) => number;
}

export const useMessageStore = create<MessageStore>((set, get) => ({
  conversations: [
    {
      id: 1,
      partner: "Sarah M.",
      avatar: "S",
      lastMessage: "That sounds perfect! When would you like to meet?",
      time: "2m ago",
      unread: 2,
      item: "Coffee Maker → Books",
      status: "matched"
    },
    {
      id: 2,
      partner: "Mike K.",
      avatar: "M",
      lastMessage: "Thanks for the swap! The books are amazing.",
      time: "1h ago",
      unread: 0,
      item: "Programming Books → Guitar",
      status: "completed"
    },
    {
      id: 3,
      partner: "Emma L.",
      avatar: "E",
      lastMessage: "Hi! I'm interested in your yoga mat.",
      time: "3h ago",
      unread: 1,
      item: "Plant Collection → Yoga Mat",
      status: "pending"
    }
  ],
  
  messages: {
    1: [
      { id: '1', conversationId: 1, sender: "partner", text: "Hi! I saw you're interested in my book collection.", timestamp: new Date('2024-01-01T10:30:00'), read: true },
      { id: '2', conversationId: 1, sender: "me", text: "Yes! I have a coffee maker that I think you'd love.", timestamp: new Date('2024-01-01T10:32:00'), read: true },
      { id: '3', conversationId: 1, sender: "partner", text: "That sounds perfect! I've been looking for one. Can you tell me more about it?", timestamp: new Date('2024-01-01T10:35:00'), read: true },
      { id: '4', conversationId: 1, sender: "me", text: "It's a vintage Chemex, barely used. Great for pour-over coffee!", timestamp: new Date('2024-01-01T10:37:00'), read: true },
      { id: '5', conversationId: 1, sender: "partner", text: "That sounds perfect! When would you like to meet?", timestamp: new Date('2024-01-01T10:40:00'), read: false }
    ],
    2: [
      { id: '6', conversationId: 2, sender: "partner", text: "Hi! I'd love to swap my programming books for your guitar.", timestamp: new Date('2024-01-01T09:00:00'), read: true },
      { id: '7', conversationId: 2, sender: "me", text: "Sounds great! The books look perfect for my learning goals.", timestamp: new Date('2024-01-01T09:15:00'), read: true },
      { id: '8', conversationId: 2, sender: "partner", text: "Thanks for the swap! The books are amazing.", timestamp: new Date('2024-01-01T11:00:00'), read: true }
    ],
    3: [
      { id: '9', conversationId: 3, sender: "partner", text: "Hi! I'm interested in your yoga mat.", timestamp: new Date('2024-01-01T08:00:00'), read: false }
    ]
  },
  
  selectedConversation: null,
  isTyping: {},
  
  setSelectedConversation: (id) => {
    set({ selectedConversation: id });
    if (id) {
      get().markAsRead(id);
    }
  },
  
  sendMessage: (conversationId, text) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      conversationId,
      sender: 'me',
      text,
      timestamp: new Date(),
      read: true
    };
    
    set((state) => {
      const updatedMessages = {
        ...state.messages,
        [conversationId]: [...(state.messages[conversationId] || []), newMessage]
      };
      
      const updatedConversations = state.conversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, lastMessage: text, time: "now" }
          : conv
      );
      
      return {
        messages: updatedMessages,
        conversations: updatedConversations
      };
    });
    
    // Simulate partner typing and response
    setTimeout(() => {
      get().setTyping(conversationId, true);
    }, 1000);
    
    setTimeout(() => {
      get().setTyping(conversationId, false);
      const responses = [
        "That sounds great!",
        "I'm interested! When can we meet?",
        "Perfect! Let me know what works for you.",
        "Awesome! I'll send you my address.",
        "Thanks for reaching out!"
      ];
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const partnerMessage: Message = {
        id: (Date.now() + 1).toString(),
        conversationId,
        sender: 'partner',
        text: randomResponse,
        timestamp: new Date(),
        read: false
      };
      
      set((state) => {
        const updatedMessages = {
          ...state.messages,
          [conversationId]: [...(state.messages[conversationId] || []), partnerMessage]
        };
        
        const updatedConversations = state.conversations.map(conv => 
          conv.id === conversationId 
            ? { ...conv, lastMessage: randomResponse, time: "now", unread: conv.unread + 1 }
            : conv
        );
        
        return {
          messages: updatedMessages,
          conversations: updatedConversations
        };
      });
    }, 3000);
  },
  
  markAsRead: (conversationId) => {
    set((state) => {
      const updatedConversations = state.conversations.map(conv => 
        conv.id === conversationId 
          ? { ...conv, unread: 0 }
          : conv
      );
      
      const updatedMessages = {
        ...state.messages,
        [conversationId]: (state.messages[conversationId] || []).map(msg => ({ ...msg, read: true }))
      };
      
      return {
        conversations: updatedConversations,
        messages: updatedMessages
      };
    });
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

  createConversationFromSwipe: (itemTitle, partnerName) => {
    const newId = Math.max(...get().conversations.map(c => c.id)) + 1;
    const newConversation: Conversation = {
      id: newId,
      partner: partnerName,
      avatar: partnerName.charAt(0),
      lastMessage: `Hi! I'm interested in your ${itemTitle}.`,
      time: "now",
      unread: 0,
      item: `Your Item → ${itemTitle}`,
      status: "matched"
    };

    const initialMessage: Message = {
      id: Date.now().toString(),
      conversationId: newId,
      sender: 'me',
      text: `Hi! I'm interested in your ${itemTitle}.`,
      timestamp: new Date(),
      read: true
    };

    set((state) => ({
      conversations: [newConversation, ...state.conversations],
      messages: {
        ...state.messages,
        [newId]: [initialMessage]
      }
    }));

    return newId;
  }
}));
