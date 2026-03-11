<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>登录</h2>
      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input id="email" v-model="form.email" type="email" required placeholder="请输入邮箱">
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input id="password" v-model="form.password" type="password" required placeholder="请输入密码">
        </div>
        <div v-if="error" class="error-message">
          {{ error }}
        </div>
        <button type="submit" class="submit-button" :disabled="loading">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        <div class="register-link">
          还没有账号？<router-link to="/register">立即注册</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
const loading = ref(false);
const error = ref('');

interface FormData {
  email: string;
  password: string;
}

const form = reactive<FormData>({
  email: '',
  password: ''
});

async function handleLogin() {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    })

    const data = await response.json()

    if (data.ok) {
      const supabase = useSupabaseClient()

      // 设置会话
      await supabase.auth.setSession({
        access_token: data.data.token,
        refresh_token: data.data.refresh_token || ''
      })

      // 强制同步用户状态（官方、无 TS 错误）
      await supabase.auth.getUser()

      // 跳转到首页
      navigateTo('/', { replace: true })
    } else {
      const errorMessage = data.error?.message || '登录失败'
      error.value = errorMessage
    }
  } catch (error) {
    console.error('登录失败:', error)
  } finally {
    loading.value = false
  }
}

</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: #f5f5f5;
}

.auth-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
}

h2 {
  margin-top: 0;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #555;
}

input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.error-message {
  background-color: #fee;
  color: #c00;
  padding: 0.5rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.submit-button {
  width: 100%;
  padding: 0.75rem;
  background-color: #0070f3;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.submit-button:hover {
  background-color: #0050c3;
}

.submit-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.register-link {
  margin-top: 1rem;
  text-align: center;
  color: #666;
}

.register-link a {
  color: #0070f3;
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>