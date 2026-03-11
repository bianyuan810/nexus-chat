<template>
  <div class="auth-container">
    <div class="auth-form">
      <h2>注册</h2>
      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="name">姓名</label>
          <input 
            type="text" 
            id="name" 
            v-model="form.name" 
            required 
            placeholder="请输入姓名"
          />
        </div>
        <div class="form-group">
          <label for="email">邮箱</label>
          <input 
            type="email" 
            id="email" 
            v-model="form.email" 
            required 
            placeholder="请输入邮箱"
          />
        </div>
        <div class="form-group">
          <label for="password">密码</label>
          <input 
            type="password" 
            id="password" 
            v-model="form.password" 
            required 
            placeholder="请输入密码"
          />
        </div>
        <button type="submit" class="btn-submit" :disabled="loading">
          {{ loading ? '注册中...' : '注册' }}
        </button>
        <div class="error-message" v-if="error">{{ error }}</div>
        <div class="redirect-link">
          已有账号？ <router-link to="/login">去登录</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const error = ref('');

interface FormData {
  name: string;
  email: string;
  password: string;
}

const form = reactive<FormData>({
  name: '',
  email: '',
  password: ''
});

async function handleRegister() {
  loading.value = true;
  error.value = '';
  
  try {
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(form)
    });
    
    const result = await response.json();
    
    if (result.ok) {
      // 注册成功后跳转到登录页
      await router.push('/login');
    } else {
      error.value = result.error?.message || '注册失败';
    }
  } catch (err) {
    error.value = '网络错误，请稍后重试';
    console.error('注册错误:', err);
  } finally {
    loading.value = false;
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

.auth-form h2 {
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
}

.form-group input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.btn-submit {
  width: 100%;
  padding: 0.75rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  margin-top: 1rem;
}

.btn-submit:hover {
  background-color: #3182ce;
}

.btn-submit:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}

.error-message {
  color: #e53e3e;
  margin-top: 1rem;
  text-align: center;
}

.redirect-link {
  margin-top: 1rem;
  text-align: center;
  color: #666;
}

.redirect-link a {
  color: #4299e1;
  text-decoration: none;
}

.redirect-link a:hover {
  text-decoration: underline;
}
</style>
