import { create } from 'zustand'
import type { Message } from '@/services/messageService'

interface MessageState {
  messages: Message[]
  currentMessage: Message | null
  isLoading: boolean
  setMessages: (messages: Message[]) => void
  setCurrentMessage: (message: Message | null) => void
  addMessage: (message: Message) => void
  removeMessage: (id: string) => void
  setLoading: (loading: boolean) => void
}

export const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  currentMessage: null,
  isLoading: false,

  setMessages: (messages) => set({ messages }),
  setCurrentMessage: (currentMessage) => set({ currentMessage }),
  addMessage: (message) => set((s) => ({ messages: [message, ...s.messages] })),
  removeMessage: (id) => set((s) => ({ messages: s.messages.filter((m) => m.id !== id) })),
  setLoading: (isLoading) => set({ isLoading }),
}))
