// api/stores.ts
// Função serverless da Vercel que devolve a base de lojas.

import { INITIAL_STORES } from '../src/data/initialStores';

export default function handler(
  req: { method: string },
  res: {
    status: (code: number) => { json: (body: unknown) => void };
    json: (body: unknown) => void;
  }
): void {
  // Resolve o problema principal: GET /api/stores retorna as lojas
  if (req.method === 'GET') {
    res.status(200).json({
      stores: INITIAL_STORES,
      lastModified: new Date().toISOString(),
    });
    return;
  }

  // POST/PUT/DELETE: na Vercel o disco é somente leitura — para gravar
  // de verdade seria preciso um banco (Vercel KV, Supabase, Postgres).
  // Por ora retornamos erro claro em vez de falhar em silêncio.
  res.status(405).json({ error: 'Somente consulta (GET) disponível na Vercel.' });
}

