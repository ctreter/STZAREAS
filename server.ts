import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { INITIAL_STORES } from './src/data/initialStores.ts';
import type { StoreAreaRecord, TipoLoja } from './src/types/store.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.resolve(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'stores.json');
const CURRENT_DATA_VERSION = 4;

interface StoreDatabase {
  dataVersion?: number;
  stores: StoreAreaRecord[];
  lastModified: string;
}

function getStoreKey(store: Pick<StoreAreaRecord, 'id' | 'numero'>): string {
  return store.id ?? store.numero;
}

function ensureDatabase(): StoreDatabase {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    const initial: StoreDatabase = {
      dataVersion: CURRENT_DATA_VERSION,
      stores: INITIAL_STORES,
      lastModified: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2), 'utf-8');
    return initial;
  }
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  const parsed = JSON.parse(raw) as StoreDatabase;
    if (parsed.dataVersion !== CURRENT_DATA_VERSION || (parsed.stores?.length ?? 0) === 0) {
    const upgraded: StoreDatabase = {
      dataVersion: CURRENT_DATA_VERSION,
      stores: INITIAL_STORES,
      lastModified: new Date().toISOString(),
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(upgraded, null, 2), 'utf-8');
    return upgraded;
  }
  return parsed;
 }

function saveDatabase(db: StoreDatabase): void {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(
    DATA_FILE,
    JSON.stringify({ ...db, dataVersion: CURRENT_DATA_VERSION }, null, 2),
    'utf-8',
  );
}

function parseNullableNumber(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num * 100) / 100;
}

function parseNullableInt(val: unknown): number | null {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) return null;
  return Math.round(num);
}

function parseRequiredNumber(val: unknown): number {
  const num = Number(val);
  if (!Number.isFinite(num) || num < 0) return 0;
  return Math.round(num * 100) / 100;
}

function normalizeTipoLoja(raw: unknown): TipoLoja {
  const upper = String(raw ?? 'SHOPPING').trim().toUpperCase();
  if (upper === 'RUA') return 'RUA';
  if (upper === 'CD') return 'CD';
  if (upper === 'ESCRITÓRIO' || upper === 'ESCRITORIO') return 'ESCRITÓRIO';
  return 'SHOPPING';
}

function sanitizeStorePayload(
  body: Record<string, unknown>,
  existing?: StoreAreaRecord,
): { data?: StoreAreaRecord; error?: string } {
  const numero = String(existing?.numero ?? body.numero ?? '').trim();
  const nome = String(body.nome ?? '').trim();
  const cidade = String(body.cidade ?? '').trim();
  const estado = String(body.estado ?? '').trim().toUpperCase();
  const cnpj = String(body.cnpj ?? '').trim() || '-';
  const tipoLoja = normalizeTipoLoja(body.tipoLoja);
  const id = existing?.id ?? (body.id ? String(body.id).trim() : undefined);

  if (!numero || numero.length > 20) {
    return { error: 'Número da unidade é obrigatório (máx. 20 caracteres).' };
  }
  if (!nome || nome.length > 120) {
    return { error: 'Nome da unidade é obrigatório (máx. 120 caracteres).' };
  }
  if (!cidade || cidade.length > 80) {
    return { error: 'Cidade é obrigatória.' };
  }
  if (!estado || estado.length !== 2) {
    return { error: 'UF (Estado) deve ter exatamente 2 letras.' };
  }

  const areaTotal = parseRequiredNumber(body.areaTotal);
  const areaVendas = parseRequiredNumber(body.areaVendas);

  const record: StoreAreaRecord = {
    ...(id ? { id } : {}),
    numero,
    nome,
    cidade,
    estado,
    endereco: body.endereco ? String(body.endereco).trim().slice(0, 240) : undefined,
    bairro: body.bairro ? String(body.bairro).trim().slice(0, 120) : undefined,
    cep: body.cep ? String(body.cep).trim().slice(0, 20) : undefined,
    regiao: body.regiao ? String(body.regiao).trim().slice(0, 60) : undefined,
    cnpj,
    tipoLoja,
    gerenteResponsavel: body.gerenteResponsavel ? String(body.gerenteResponsavel).trim().slice(0, 120) : undefined,
    ramal: body.ramal ? String(body.ramal).trim().slice(0, 40) : undefined,
    telComerciais: body.telComerciais ? String(body.telComerciais).trim().slice(0, 80) : undefined,
    regionalResponsavel: body.regionalResponsavel ? String(body.regionalResponsavel).trim().slice(0, 100) : undefined,
    abreDom: body.abreDom ? String(body.abreDom).trim().slice(0, 10) : undefined,
    horarioSemana: body.horarioSemana ? String(body.horarioSemana).trim().slice(0, 40) : undefined,
    horarioSabado: body.horarioSabado ? String(body.horarioSabado).trim().slice(0, 40) : undefined,
    horarioDomingo: body.horarioDomingo ? String(body.horarioDomingo).trim().slice(0, 40) : undefined,
    areaTotal,
    areaVendas,
    copa: parseNullableNumber(body.copa),
    salaTi: parseNullableNumber(body.salaTi),
    salaVm: parseNullableNumber(body.salaVm),
    almox: parseNullableNumber(body.almox),
    casaMaq: parseNullableNumber(body.casaMaq),
    subestacao: parseNullableNumber(body.subestacao),
    deposito: parseNullableNumber(body.deposito),
    sanitFem: parseNullableNumber(body.sanitFem),
    sanitMasc: parseNullableNumber(body.sanitMasc),
    sanitPne: parseNullableNumber(body.sanitPne),
    sanitPneObs: body.sanitPneObs ? String(body.sanitPneObs).trim().slice(0, 60) : undefined,
    areaTecnica: parseNullableNumber(body.areaTecnica),
    areaTerreo: parseNullableNumber(body.areaTerreo),
    areaMezanino: parseNullableNumber(body.areaMezanino),
    area1Pav: parseNullableNumber(body.area1Pav),
    area2Pav: parseNullableNumber(body.area2Pav),
    areaTotalConstruida: parseNullableNumber(body.areaTotalConstruida),
    estacionamento: parseNullableNumber(body.estacionamento),
    estacionamentoObs: body.estacionamentoObs ? String(body.estacionamentoObs).trim().slice(0, 60) : undefined,
    escadaRolante: String(body.escadaRolante ?? '-').trim() || '-',
    escada: String(body.escada ?? '-').trim() || '-',
    elevador: String(body.elevador ?? '-').trim() || '-',
    plataformaPne: String(body.plataformaPne ?? '-').trim() || '-',
    acSplit: parseNullableInt(body.acSplit),
    acSplitaoSelf: parseNullableInt(body.acSplitaoSelf),
    acFancoil: parseNullableInt(body.acFancoil),
    acVrf: parseNullableInt(body.acVrf),
    observacoes: body.observacoes ? String(body.observacoes).trim().slice(0, 500) : undefined,
    updatedBy: body.updatedBy ? String(body.updatedBy).trim().slice(0, 80) : undefined,
    updatedAt: new Date().toISOString(),
  };

  return { data: record };
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '1mb' }));

  app.get('/api/stores', (_req, res) => {
    try {
      const db = ensureDatabase();
      res.json({ stores: db.stores, lastModified: db.lastModified });
    } catch (error) {
      console.error('Error reading stores:', error);
      res.status(500).json({ error: 'Erro ao carregar a base consolidada.' });
    }
  });

  app.post('/api/stores', (req, res) => {
    try {
      const db = ensureDatabase();
      const parsed = sanitizeStorePayload(req.body as Record<string, unknown>);
      if (parsed.error || !parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Dados inválidos.' });
        return;
      }

      const duplicateNum = db.stores.some(
        (s) => s.numero.toLowerCase() === parsed.data!.numero.toLowerCase(),
      );
      if (duplicateNum && !parsed.data.id) {
        parsed.data.id = `${parsed.data.numero}-${Date.now()}`;
      }

      if (parsed.data.id && db.stores.some((s) => getStoreKey(s) === parsed.data!.id)) {
        res.status(409).json({ error: `Já existe uma unidade cadastrada com o identificador ${parsed.data.id}.` });
        return;
      }

      db.stores.push(parsed.data);
      db.stores.sort((a, b) => a.numero.localeCompare(b.numero, 'pt-BR', { numeric: true }));
      db.lastModified = new Date().toISOString();
      saveDatabase(db);

      res.status(201).json({ store: parsed.data, lastModified: db.lastModified });
    } catch (error) {
      console.error('Error creating store:', error);
      res.status(500).json({ error: 'Erro ao adicionar unidade.' });
    }
  });

  app.put('/api/stores/:id', (req, res) => {
    try {
      const db = ensureDatabase();
      const targetId = decodeURIComponent(req.params.id);
      const index = db.stores.findIndex((s) => s.id === targetId || s.numero === targetId);
      if (index === -1) {
        res.status(404).json({ error: `Unidade ${targetId} não encontrada.` });
        return;
      }

      const parsed = sanitizeStorePayload(req.body as Record<string, unknown>, db.stores[index]);
      if (parsed.error || !parsed.data) {
        res.status(400).json({ error: parsed.error ?? 'Dados inválidos.' });
        return;
      }

      db.stores[index] = parsed.data;
      db.lastModified = new Date().toISOString();
      saveDatabase(db);

      res.json({ store: parsed.data, lastModified: db.lastModified });
    } catch (error) {
      console.error('Error updating store:', error);
      res.status(500).json({ error: 'Erro ao atualizar unidade.' });
    }
  });

  app.delete('/api/stores/:id', (req, res) => {
    try {
      const db = ensureDatabase();
      const targetId = decodeURIComponent(req.params.id);
      const next = db.stores.filter((s) => s.id !== targetId && s.numero !== targetId);
      if (next.length === db.stores.length) {
        res.status(404).json({ error: `Unidade ${targetId} não encontrada.` });
        return;
      }

      db.stores = next;
      db.lastModified = new Date().toISOString();
      saveDatabase(db);

      res.json({ deleted: targetId, lastModified: db.lastModified });
    } catch (error) {
      console.error('Error deleting store:', error);
      res.status(500).json({ error: 'Erro ao remover unidade.' });
    }
  });

  app.post('/api/stores/reset', (_req, res) => {
    try {
      const db: StoreDatabase = {
        dataVersion: CURRENT_DATA_VERSION,
        stores: INITIAL_STORES,
        lastModified: new Date().toISOString(),
      };
      saveDatabase(db);
      res.json({ stores: db.stores, lastModified: db.lastModified });
    } catch (error) {
      console.error('Error resetting stores:', error);
      res.status(500).json({ error: 'Erro ao restaurar base original.' });
    }
  });

  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`stz - areas consolidadas server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
