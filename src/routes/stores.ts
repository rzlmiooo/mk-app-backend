import { Elysia } from "elysia";
import { supabase } from "../lib/supabase";

export const store = new Elysia({ prefix: '/store' })
    .get('/search', async ({ query }) => {
        const { keyword } = query;
        if (!keyword) return { error: "Keyword required" };
        const { data, error } = await supabase
        .from("store")
        .select("*")
        .ilike("keyword", `%${keyword}%`);
        if (error) return { error: error.message };
        return data;
    })
    .get('/', async () => {
        const { data, error } = await supabase
        .from('store')
        .select('*');
        if (error) return { error: error.message };
        return { store: data };
    });
