// routes/osm.ts
import { Elysia } from 'elysia'
import { supabase } from '../lib/supabase'

export const osmRoutes = new Elysia({ prefix: '/osm' })
  .get('/:lat/:lon', async ({ params }) => {
    const { lat, lon } = params

    // Ambil data dari Overpass API OSM
    const query = `
      [out:json];
      node(around:500, ${lat}, ${lon})[amenity];
      out;
    `
    const url = 'https://overpass-api.de/api/interpreter'
    const res = await fetch(url, {
      method: 'POST',
      body: query
    })

    if (!res.ok) {
      return { error: 'Gagal fetch dari OSM' }
    }

    const data = await res.json()

    // Misal simpan ke Supabase
    const { error } = await supabase
      .from('osm_data')
      .insert({ lat, lon, raw_data: data })

    if (error) {
      return { error: 'Gagal simpan ke Supabase', detail: error.message }
    }

    return { success: true, data }
  })