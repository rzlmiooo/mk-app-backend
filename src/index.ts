import { Elysia } from 'elysia'
import { supabase } from '../src/lib/supabase'
import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'

const app = new Elysia()

app
  .use(cors())
  .use(swagger())
  .get('/users', async () => {
  const { data, error } = await supabase
    .from('users')
    .select('*');
    if (error) return { error: error.message };
    console.log("res: ", data);
    return { users: data };
  })
  .get('/stores', async () => {
    const { data, error } = await supabase
      .from('stores')
      .select('*');
      if (error) return { error: error.message };
      console.log("res: ", data);
      return { stores: data };
    })

  .listen(5000)

console.log('🦊 Elysia is running at http://localhost:5000');
