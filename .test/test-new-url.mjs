import { createClient } from '@supabase/supabase-js'

console.log('='.repeat(60))
console.log('测试新的 Supabase URL')
console.log('='.repeat(60))

const config = {
  url: 'https://hmddufqrzqvysurzggsgsg.supabase.co',
  publishableKey: 'sb_publishable_BIGDdRMwxzWtyf4-SHp6mw_pPb9tYc9',
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhtZGR1ZnFyenF2eXN1cnpnZ3NnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mjg1OTcyOCwiZXhwIjoyMDg4NDM1NzI4fQ.KO4gPD9gL4sx1wVN0LgV5UTeY2DvdjYKYPNQoNB2guY'
}

console.log('\n📋 配置信息:')
console.log(`  URL: ${config.url}`)
console.log(`  Publishable Key: ${config.publishableKey.substring(0, 20)}...`)
console.log(`  Service Key: ${config.serviceKey.substring(0, 20)}...`)

async function testConnection(key, label) {
  console.log(`\n🔍 测试 ${label}...`)
  
  try {
    const client = createClient(config.url, key)
    const { data, error } = await client.from('users').select('count').limit(1)
    
    if (error) {
      console.log(`  ❌ 失败: ${error.message}`)
      if (error.details) {
        console.log(`  📄 详情: ${JSON.stringify(error.details, null, 2)}`)
      }
      return false
    }
    
    console.log(`  ✅ 成功!`)
    return true
  } catch (error) {
    console.log(`  ❌ 异常: ${error.message}`)
    if (error.cause) {
      console.log(`  🔍 原因: ${error.cause.message}`)
    }
    return false
  }
}

console.log('\n' + '='.repeat(60))
console.log('开始测试...')
console.log('='.repeat(60))

const publishableResult = await testConnection(config.publishableKey, 'Publishable Key')
const serviceResult = await testConnection(config.serviceKey, 'Service Role Key')

console.log('\n' + '='.repeat(60))
console.log('测试结果总结:')
console.log('='.repeat(60))
console.log(`  Publishable Key: ${publishableResult ? '✅' : '❌'}`)
console.log(`  Service Role Key: ${serviceResult ? '✅' : '❌'}`)

if (!publishableResult && !serviceResult) {
  console.log('\n⚠️  连接失败，可能的原因:')
  console.log('  1. 网络连接问题（VPN、代理、防火墙）')
  console.log('  2. Supabase 项目已暂停或删除')
  console.log('  3. DNS 解析问题')
  console.log('  4. API 密钥已过期或无效')
  console.log('\n💡 建议的解决方案:')
  console.log('  1. 检查 Supabase Dashboard 确认项目状态')
  console.log('  2. 临时禁用 VPN/代理')
  console.log('  3. 检查网络连接和防火墙设置')
  console.log('  4. 尝试使用其他网络（如手机热点）')
}

console.log('\n' + '='.repeat(60))
