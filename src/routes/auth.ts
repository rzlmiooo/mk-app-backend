import { Elysia } from "elysia";
import { supabase } from '../lib/supabase'

export const auth = new Elysia({ prefix: '/users' })
  .get('/', async () => {
    const { data, error } = await supabase.from("users").select("*");
    if (error) return { error: error.message };
    return data;
  });
