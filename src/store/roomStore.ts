import { create } from 'zustand';
import { User, Room, Message } from '@/types';

interface RoomState {
  // Room data
  currentRoom: Room | null;
  users: User[];
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
  
  // User data
  currentUser: User | null;
  
  // Actions
  setCurrentRoom: (room: Room | null) => void;
  setUsers: (users: User[]) => void;
  addUser: (user: User) => void;
  removeUser: (userId: string) => void;
  updateUser: (userId: string, updates: Partial<User>) => void;
  setCurrentUser: (user: User | null) => void;
  
  // Messages
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  
  // Connection
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Reset
  reset: () => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  // Initial state
  currentRoom: null,
  users: [],
  messages: [],
  isConnected: false,
  isLoading: false,
  error: null,
  currentUser: null,
  
  // Actions
  setCurrentRoom: (room) => set({ currentRoom: room }),
  
  setUsers: (users) => set({ users }),
  
  addUser: (user) => set((state) => ({
    users: [...state.users, user]
  })),
  
  removeUser: (userId) => set((state) => ({
    users: state.users.filter(user => user.id !== userId)
  })),
  
  updateUser: (userId, updates) => set((state) => ({
    users: state.users.map(user => 
      user.id === userId ? { ...user, ...updates } : user
    )
  })),
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setConnected: (connected) => set({ isConnected: connected }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  
  reset: () => set({
    currentRoom: null,
    users: [],
    messages: [],
    isConnected: false,
    isLoading: false,
    error: null,
    currentUser: null,
  }),
}));