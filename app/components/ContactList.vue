<template>
  <div class="contact-list">
    <div class="contact-list-header">
      <h2>联系人</h2>
    </div>
    
    <div 
      class="contact-list-content" 
      @touchstart="handleTouchStart" 
      @touchmove="handleTouchMove" 
      @touchend="handleTouchEnd"
    >
      <!-- 下拉刷新指示器 -->
      <div class="pull-refresh-indicator" :class="{ 'active': isPulling, 'refreshing': isRefreshing }">
        <span v-if="!isRefreshing">下拉刷新</span>
        <span v-else>正在刷新...</span>
      </div>
      
      <!-- 加载状态 -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>加载联系人中...</p>
      </div>
      
      <!-- 错误状态 -->
      <div v-else-if="error" class="error-state">
        <p class="error-message">{{ error }}</p>
        <button @click="fetchContacts" class="retry-button">重试</button>
      </div>
      
      <!-- 联系人列表 -->
      <ul v-else class="contacts">
        <li 
          v-for="contact in contacts" 
          :key="contact.id" 
          class="contact-item"
          @click="handleContactClick(contact)"
        >
          <div class="contact-avatar">
            <img 
              v-if="contact.avatar_url" 
              :src="contact.avatar_url" 
              :alt="contact.name || contact.email"
            />
            <div v-else class="avatar-placeholder">
              {{ getInitials(contact.name || contact.email) }}
            </div>
          </div>
          <div class="contact-info">
            <div class="contact-name">{{ contact.name || contact.email }}</div>
            <div v-if="contact.last_message" class="contact-last-message">
              {{ contact.last_message.content }}
            </div>
            <div v-else class="contact-last-message empty">
              暂无消息
            </div>
          </div>
          <div v-if="contact.last_message" class="contact-time">
            {{ formatTime(contact.last_message.created_at) }}
          </div>
        </li>
      </ul>
      
      <!-- 空状态 -->
      <div v-if="!isLoading && !error && contacts.length === 0" class="empty-state">
        <p>暂无联系人</p>
      </div>
    </div>
  </div>
</template>

<script setup>

// 状态管理
const contacts = ref([])
const isLoading = ref(true)
const error = ref(null)
const isRefreshing = ref(false)
const startY = ref(0)
const pullDistance = ref(0)
const isPulling = ref(false)

// 计算属性
const pullRefreshThreshold = 80

// 方法
const fetchContacts = async () => {
  try {
    isLoading.value = true
    error.value = null
    
    const response = await fetch('/api/contacts')
    const data = await response.json()
    
    if (data.ok) {
      contacts.value = data.data
    } else {
      error.value = data.error?.message || '获取联系人失败'
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试'
  } finally {
    isLoading.value = false
    isRefreshing.value = false
  }
}

const handleContactClick = (contact) => {
  if (contact.conversation_id) {
    navigateTo(`/?conversation_id=${contact.conversation_id}&contact_id=${contact.id}`)
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name[0].toUpperCase()
}

const formatTime = (timestamp) => {
  const date = new Date(timestamp)
  const now = new Date()
  const diffMs = now - date
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)
  
  if (diffMins < 1) return '刚刚'
  if (diffMins < 60) return `${diffMins}分钟前`
  if (diffHours < 24) return `${diffHours}小时前`
  if (diffDays < 7) return `${diffDays}天前`
  
  return date.toLocaleDateString()
}

// 下拉刷新相关方法
const handleTouchStart = (e) => {
  if (window.scrollY === 0) {
    startY.value = e.touches[0].clientY
  }
}

const handleTouchMove = (e) => {
  if (window.scrollY === 0 && startY.value > 0) {
    const currentY = e.touches[0].clientY
    pullDistance.value = currentY - startY.value
    
    if (pullDistance.value > 0) {
      e.preventDefault()
      isPulling.value = true
    }
  }
}

const handleTouchEnd = () => {
  if (pullDistance.value >= pullRefreshThreshold) {
    isRefreshing.value = true
    fetchContacts()
  }
  
  isPulling.value = false
  pullDistance.value = 0
  startY.value = 0
}

// 生命周期
onMounted(() => {
  fetchContacts()
})
</script>

<style scoped>
.contact-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: #f5f5f5;
}

.contact-list-header {
  padding: 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
}

.contact-list-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
}

.contact-list-content {
  flex: 1;
  overflow-y: auto;
  position: relative;
}

.pull-refresh-indicator {
  height: 0;
  overflow: hidden;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: height 0.3s ease;
  background-color: #f5f5f5;
}

.pull-refresh-indicator.active {
  height: 50px;
}

.pull-refresh-indicator.refreshing {
  height: 50px;
}

.loading-state,
.error-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-message {
  color: #e74c3c;
  margin-bottom: 16px;
}

.retry-button {
  padding: 8px 16px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.retry-button:hover {
  background-color: #2980b9;
}

.contacts {
  list-style: none;
  padding: 0;
  margin: 0;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #e0e0e0;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.contact-item:hover {
  background-color: #f9f9f9;
}

.contact-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  flex-shrink: 0;
}

.contact-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  width: 100%;
  height: 100%;
  background-color: #3498db;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 600;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.contact-last-message {
  font-size: 14px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.contact-last-message.empty {
  color: #999;
  font-style: italic;
}

.contact-time {
  font-size: 12px;
  color: #999;
  margin-left: 12px;
  flex-shrink: 0;
}
</style>