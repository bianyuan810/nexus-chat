import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://xvohtgkpxugulnrnafpb.supabase.co'
const supabaseKey = 'sb_publishable_BIGDdRMwxzWtyf4-SHp6mw_pPb9tYc9'

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

try {
  const supabase = createClient(supabaseUrl, supabaseKey)
  
  console.log('Client created successfully')
  
  const { data, error } = await supabase.from('users').select('count').limit(1)
  
  if (error) {
    console.error('Query error:', error)
  } else {
    console.log('Connection successful! Data:', data)
  }
} catch (error) {
  console.error('Connection error:', error)
}
