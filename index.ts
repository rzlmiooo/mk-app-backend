import { Elysia } from 'elysia';
import { supabase } from './lib/supabase';
import cors from '@elysiajs/cors';
import swagger from '@elysiajs/swagger';

const app = new Elysia();

app.use(cors()).use(swagger());
app.get('/stores', async () => {
  const { data, error } = await supabase
    .from('stores')
    .select('*');

  if (error) return { error: error.message };
  return { stores: data };
});

app.listen(3000);
console.log('🦊 Elysia is running at http://localhost:3000');
