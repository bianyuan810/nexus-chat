// 测试 Supabase 连接脚本
import { createClient } from '@supabase/supabase-js';

// 从环境变量获取 Supabase 配置
const SUPABASE_URL = process.env.NUXT_PUBLIC_SUPABASE_URL || 'https://hmddufqrzqvysurzggsg.supabase.co';
const SUPABASE_ANON_KEY = process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZGR1ZnFyenF2eXN1cnpnZ3NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4NTk3MjgsImV4cCI6MjA4ODQzNTcyOH0.ZlLFl1HSh7MLPJ6e47qaFeBd77SD7OJwygjP4T1UI04';

// 创建 Supabase 客户端
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testSupabaseConnection() {
  console.log('开始测试 Supabase 连接...');
  
  try {
    // 测试连接
    console.log('连接到 Supabase:', SUPABASE_URL);
    
    // 测试获取会话（应该返回 null，因为未登录）
    const { data: { session } } = await supabase.auth.getSession();
    console.log('会话状态:', session ? '已登录' : '未登录');
    
    // 测试数据库查询（尝试获取用户表的结构）
    console.log('测试数据库查询...');
    const { data, error } = await supabase
      .from('users')
      .select('id, name, email')
      .limit(1);
    
    if (error) {
      console.log('查询错误:', error.message);
      console.log('错误代码:', error.code);
    } else {
      console.log('查询成功:', data);
    }
    
    console.log('✓ Supabase 连接测试完成');
  } catch (error) {
    console.error('测试失败:', error);
  }
}

// 运行测试
testSupabaseConnection();
