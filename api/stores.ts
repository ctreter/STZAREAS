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
  if (req.method === 'GET') {
    res.status(200).json({
      stores: INITIAL_STORES,
      lastModified: new Date().toISOString(),
    });
    return;
  }

 
