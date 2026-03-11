<template>
  <div class="contacts-page">
    <!-- 页面头部 -->
    <header class="page-header">
      <div class="header-content">
        <div class="nav-buttons">
          <router-link to="/" class="nav-button"><i class="fas fa-comment"></i> 聊天</router-link>
          <router-link to="/contacts" class="nav-button active"><i class="fas fa-address-book"></i> 联系人管理</router-link>
        </div>
        <h1>联系人管理</h1>
        <p class="page-description">查看、搜索和管理您的联系人</p>
      </div>
    </header>

    <!-- 主要内容 -->
    <main class="page-content">
      <!-- 搜索部分 -->
      <section class="search-section">
        <h2>添加联系人</h2>
        <p>搜索并添加新的联系人</p>
        <ContactSearch @contactAdded="handleContactAdded" />
      </section>

      <!-- 联系人列表部分 -->
      <section class="contacts-section">
        <ContactList />
      </section>
    </main>
  </div>
</template>

<script setup>
const handleContactAdded = (contact) => {
  // 当联系人添加成功时，可以刷新联系人列表或显示成功提示
  console.log('Contact added:', contact);
  // 这里可以添加刷新联系人列表的逻辑
};
</script>

<style scoped>
.contacts-page {
  min-height: 100vh;
  background-color: #f8fafc;
  display: flex;
  flex-direction: column;
}

.page-header {
  background-color: #fff;
  border-bottom: 1px solid #e2e8f0;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
}

.nav-buttons {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
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

.header-content h1 {
  margin: 0 0 8px 0;
  font-size: 24px;
  font-weight: 600;
  color: #1e293b;
}

.page-description {
  margin: 0;
  font-size: 14px;
  color: #64748b;
}

.page-content {
  flex: 1;
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.search-section {
  background-color: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.search-section h2 {
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
}

.search-section p {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: #64748b;
}

.contacts-section {
  background-color: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  flex: 1;
  min-height: 400px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: 16px;
  }

  .header-content h1 {
    font-size: 20px;
  }

  .page-content {
    padding: 16px;
    gap: 20px;
  }

  .search-section {
    padding: 20px;
  }

  .search-section h2 {
    font-size: 16px;
  }
}

@media (max-width: 480px) {
  .page-header {
    padding: 12px;
  }

  .header-content h1 {
    font-size: 18px;
  }

  .page-content {
    padding: 12px;
    gap: 16px;
  }

  .search-section {
    padding: 16px;
  }
}
</style>