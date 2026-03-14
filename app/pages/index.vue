<template>
  <div class="chat-container">
    <div class="sidebar">
      <div class="sidebar-header">
        <div class="header-buttons">
          <router-link to="/" class="nav-button active"><i class="fas fa-comment"></i> 聊天</router-link>
          <router-link to="/contacts" class="nav-button"><i class="fas fa-address-book"></i> 联系人管理</router-link>
        </div>
        <button class="logout-button" @click="handleLogout">注销</button>
      </div>
      <div class="contacts-list">
        <div v-if="loading" class="loading">加载中...</div>
        <div v-else-if="error" class="error">{{ error }}</div>
        <div v-else-if="contacts.length === 0" class="empty-state">
          暂无联系人
        </div>
        <div
          v-for="contact in contacts"
          :key="contact.id"
          class="contact-item"
          @click="selectContact(contact)"
        >
          <div class="contact-avatar">
            <img 
              v-if="contact.avatar_url" 
              :src="contact.avatar_url" 
              :alt="contact.name"
            >
            <div v-else class="avatar-placeholder">
              {{ contact.name.charAt(0) }}
            </div>
          </div>
          <div class="contact-info">
            <div class="contact-name">{{ contact.name }}</div>
            <div class="contact-email">{{ contact.email }}</div>
          </div>
        </div>
      </div>
    </div>
    <div v-if="selectedContact" class="chat-area">
      <div class="chat-header">
        <div class="contact-info">
          <div class="contact-avatar">
            <img 
              v-if="selectedContact.avatar_url" 
              :src="selectedContact.avatar_url" 
              :alt="selectedContact.name"
            >
            <div v-else class="avatar-placeholder">
              {{ selectedContact.name.charAt(0) }}
            </div>
          </div>
          <div class="contact-name">{{ selectedContact.name }}</div>
        </div>
      </div>
      <div class="chat-messages" ref="chatMessagesRef">
        <div v-if="loadingMessages" class="loading">加载消息中...</div>
        <div v-else-if="messagesError" class="error">{{ messagesError }}</div>
        <div v-else-if="messages.length === 0" class="message-placeholder">
          开始与 {{ selectedContact.name }} 聊天
        </div>
        <div 
          v-for="msg in messages" 
          :key="msg.id" 
          class="message"
          :class="{ 'own-message': msg.user_id === currentUserId }"
        >
          <div class="message-avatar">
            <img 
              v-if="msg.user?.avatar_url" 
              :src="msg.user.avatar_url" 
              :alt="msg.user.name"
            >
            <div v-else class="avatar-placeholder">
              {{ msg.user?.name?.charAt(0) }}
            </div>
          </div>
          <div class="message-content">
            <div class="message-sender">{{ msg.user?.name }}</div>
            <div class="message-text">{{ msg.content }}</div>
            <div class="message-time">{{ formatTime(msg.created_at) }}</div>
          </div>
        </div>
      </div>
      <div class="chat-input">
        <input 
          v-model="message"
          type="text" 
          placeholder="输入消息..."
          @keyup.enter="sendMessage"
        >
        <button  :disabled="sending" @click="sendMessage">发送</button>
      </div>
    </div>
    <div v-else class="chat-area empty">
      <div class="empty-chat">
        <h3>选择一个联系人开始聊天</h3>
        <p>从左侧列表中选择一个联系人</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, onUnmounted, nextTick } from 'vue'
import { useRoute } from 'vue-router'

import type { RealtimeChannel } from '@supabase/supabase-js'

const supabase = useSupabaseClient()
const chatMessagesRef = ref<HTMLElement | null>(null)

interface Contact {
  id: string
  name: string
  email: string
  avatar_url: string
  conversation_id: string
  conversation_type: string
  conversation_name: string
}

interface User {
  id: string
  name: string
  email: string
  avatar_url: string
}

interface Message {
  id: string
  conversation_id: string
  user_id: string
  content: string
  created_at: string
  user?: User
}

const route = useRoute()
const contacts = ref<Contact[]>([])
const loading = ref(true)
const error = ref('')
const selectedContact = ref<Contact | null>(null)
const message = ref('')
const messages = ref<Message[]>([])
const loadingMessages = ref(false)
const messagesError = ref('')
const sending = ref(false)
const currentUserId = ref('')
const subscription = ref<RealtimeChannel | null>(null)

const fetchContacts = async () => {
  try {
    loading.value = true
    error.value = ''
    const response = await fetch('/api/contacts')
    const data = await response.json()
    
    if (data.ok) {
      contacts.value = data.data
      
    } else {
      error.value = data.error.message || '获取联系人失败'
    }
  } catch (err) {
    console.error('获取联系人错误:', err)
    error.value = '获取联系人失败，请重试'
  } finally {
    loading.value = false
  }
}

const fetchMessages = async (conversationId: string) => {
  try {
    loadingMessages.value = true
    messagesError.value = ''
    const response = await fetch(`/api/messages/${conversationId}`)
    const data = await response.json()
    console.log('获取消息:',data.data);
    
    if (data.ok) {
      messages.value = data.data
      
      await scrollToBottom()
    } else {
      messagesError.value = data.error.message
    }
  } catch  {
    messagesError.value = '获取消息失败，请重试'
  } finally {
    loadingMessages.value = false
  }
}

const selectContact = (contact: Contact) => {
  selectedContact.value = contact
  fetchMessages(contact.conversation_id)
  setupRealtimeSubscription(contact.conversation_id)
}

const sendMessage = async () => {
  if (!message.value.trim() || !selectedContact.value || sending.value) return
  
  try {
    sending.value = true
    const response = await fetch('/api/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: message.value,
        conversation_id: selectedContact.value.conversation_id
      })
    })
    const data = await response.json()
    if (data.ok) {
      // 消息会通过实时订阅添加，这里不需要手动添加
      message.value = ''
    } else {
      console.error('发送消息失败:', data.error.message)
    }
  } catch (err) {
    console.error('发送消息失败:', err)
  } finally {
    sending.value = false
  }
}

const setupRealtimeSubscription = (conversationId: string) => {
  // 取消之前的订阅
  if (subscription.value) {
    subscription.value.unsubscribe()
  }

  // 创建新的订阅
  subscription.value = supabase
    .channel(`messages:${conversationId}`)
    .on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'messages',
      filter: `conversation_id=eq.${conversationId}`
    }, (payload: { new: Message }) => {
      // 检查消息是否已存在
      const messageExists = messages.value.some(msg => msg.id === payload.new.id)
      if (!messageExists) {
        messages.value.push({
          ...payload.new,
          user: payload.new.user || {
            id: payload.new.user_id,
            name: 'Unknown',
            email: '',
            avatar_url: ''
          }
        })
        scrollToBottom()
      }
    })
    .subscribe()
}

const handleLogout = async () => {
  try {
    // 取消订阅
    if (subscription.value) {
      subscription.value.unsubscribe()
    }
    
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    })
    const data = await response.json()
    if (data.ok) {
      // 清除 Supabase 认证状态
      await supabase.auth.signOut()
      
      currentUserId.value = ''
      messages.value = []

      // 使用 navigateTo 进行跳转
      await navigateTo('/login')
    }
  } catch (err) {
    console.error('注销失败:', err)
  }
}

const formatTime = (timestamp: string) => {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const scrollToBottom = async () => {
  await nextTick()
  if (chatMessagesRef.value) {
    chatMessagesRef.value.scrollTop = chatMessagesRef.value.scrollHeight
  }
}

const getCurrentUser = async () => {
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) {
      console.error('获取用户信息失败:', error)
      return
    }
    if (user && user.id) {
      currentUserId.value = user.id
    }
  } catch (err) {
    console.error('获取用户信息错误:', err)
  }
}

watch(selectedContact, (newContact) => {
  if (newContact) {
    fetchMessages(newContact.conversation_id)
    setupRealtimeSubscription(newContact.conversation_id)
  }
})

onUnmounted(() => {
  // 组件卸载时取消订阅
  if (subscription.value) {
    subscription.value.unsubscribe()
  }
})

const checkUrlParams = () => {
  const conversationId = route.query.conversation_id as string
  const contactId = route.query.contact_id as string
  
  if (conversationId && contactId && contacts.value.length > 0) {
    const contact = contacts.value.find(c => c.id === contactId && c.conversation_id === conversationId)
    if (contact) {
      selectContact(contact)
    }
  }
}

onMounted(async () => {
  await getCurrentUser()
  await fetchContacts()
  checkUrlParams()
})
</script>

<style scoped>
.chat-container {
  display: flex;
  height: 100vh;
  background-color: #f5f5f5;
}

.sidebar {
  width: 300px;
  background: white;
  border-right: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
}

.sidebar-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
}

.header-buttons {
  display: flex;
  gap: 8px;
}

.nav-button {
  padding: 6px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  background-color: #f8fafc;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}

.nav-button:hover {
  background-color: #e2e8f0;
  color: #1e293b;
}

.nav-button.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.logout-button {
  background-color: #f0f0f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
}

.logout-button:hover {
  background-color: #e0e0e0;
}

.contacts-list {
  flex: 1;
  overflow-y: auto;
  padding: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  margin-bottom: 0.5rem;
}

.contact-item:hover {
  background-color: #f5f5f5;
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 1rem;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #0070f3;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
}

.contact-info {
  flex: 1;
}

.contact-name {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.contact-email {
  font-size: 0.8rem;
  color: #666;
}

.loading, .error, .empty-state {
  padding: 2rem;
  text-align: center;
  color: #666;
}

.error {
  color: #c00;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: white;
}

.chat-area.empty {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}

.empty-chat {
  text-align: center;
  color: #666;
}

.empty-chat h3 {
  margin-bottom: 0.5rem;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  align-items: center;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  align-items: stretch;
}

.message-placeholder {
  color: #999;
  text-align: center;
}

.chat-input {
  padding: 1rem;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 0.5rem;
}

.chat-input input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 1rem;
}

.chat-input button {
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 0 1.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.chat-input button:hover {
  background-color: #0050c3;
}

.chat-input button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.message {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
  align-items: flex-start;
  width: 100%;
  max-width: 70%;
}

.own-message {
  align-items: flex-end;
  margin-left: auto;
}

.message-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  margin-bottom: 0.25rem;
}

.message-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.message-content {
  max-width: 70%;
  padding: 0.75rem 1rem;
  border-radius: 18px;
  background-color: #f0f0f0;
  position: relative;
}

.own-message .message-content {
  background-color: #0070f3;
  color: white;
}

.message-sender {
  font-size: 0.8rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  color: #666;
}

.own-message .message-sender {
  color: rgba(255, 255, 255, 0.8);
}

.message-text {
  margin-bottom: 0.25rem;
  word-break: break-word;
}

.message-time {
  font-size: 0.7rem;
  color: #999;
  text-align: right;
}

.own-message .message-time {
  color: rgba(255, 255, 255, 0.6);
}
</style>
