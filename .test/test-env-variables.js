// 测试环境变量加载情况
import dotenv from 'dotenv';

// 加载 .env 文件
dotenv.config();

console.log('测试环境变量加载情况:');
console.log('SUPABASE_URL:', process.env.NUXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY);
console.log('SUPABASE_SECRET_KEY:', process.env.NUXT_SUPABASE_SECRET_KEY);

// 测试 supabase 客户端初始化
import { createClient } from '@supabase/supabase-js';

try {
  const supabase = createClient(
    process.env.NUXT_PUBLIC_SUPABASE_URL,
    process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
  );
  console.log('supabase 客户端初始化成功');

} catch (error) {
  console.error('supabase 客户端初始化失败:', error);
}
