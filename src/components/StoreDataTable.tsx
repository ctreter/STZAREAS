import { ArrowDown, ArrowUp, ArrowUpDown, Eye, Pencil } from 'lucide-react';
import { formatArea, formatCount, getStoreAcTotal } from '../services/storeApi.ts';
import type {
  ColumnGroupKey,
  SortDirection,
  SortField,
  StoreAreaRecord,
} from '../types/store.ts';

interface StoreDataTableProps {
  stores: StoreAreaRecord[];
  columnGroup: ColumnGroupKey;
  sortField: SortField;
  sortDirection: SortDirection;
  onSort: (field: SortField) => void;
  onSelectStore: (store: StoreAreaRecord) => void;
  onEditStore: (store: StoreAreaRecord) => void;
  onResetFilters: () => void;
}

interface ColumnDef {
  key: string;
  label: string;
  sortKey?: SortField;
  align?: 'left' | 'right' | 'center';
  render: (store: StoreAreaRecord) => React.ReactNode;
  totalValue?: (stores: StoreAreaRecord[]) => string;
}

function renderStatusText(val: string) {
  const upper = val.trim().toUpperCase();
  if (upper === 'SIM') {
    return <span className="font-mono text-xs font-semibold text-emerald-700">SIM</span>;
  }
  if (upper === 'SIM*') {
    return <span className="font-mono text-xs font-semibold text-amber-700">SIM*</span>;
  }
  if (upper === '*OBS') {
    return <span className="font-mono text-xs font-semibold text-amber-700">*obs</span>;
  }
  if (upper === 'NÃO' || upper === 'NAO') {
    return <span className="font-mono text-xs font-semibold text-rose-700">NÃO</span>;
  }
  return <span className="font-mono text-xs text-slate-400">—</span>;
}

const NUMERIC_COLUMNS: Record<string, ColumnDef> = {
  cidade: {
    key: 'cidade',
    label: 'Cidade / UF',
    sortKey: 'cidade',
    align: 'left',
    render: (s) => (
      <span className="text-xs text-slate-700 whitespace-nowrap">
        {s.cidade} <span className="text-slate-400">·</span>{' '}
        <span className="font-medium text-slate-900">{s.estado}</span>
      </span>
    ),
  },
  endereco: {
    key: 'endereco',
    label: 'Endereço',
    align: 'left',
    render: (s) => (
      <span
        className="text-xs text-slate-600 max-w-[260px] truncate block"
        title={s.endereco || ''}
      >
        {s.endereco || '—'}
      </span>
    ),
  },
  bairro: {
    key: 'bairro',
    label: 'Bairro',
    align: 'left',
    render: (s) => (
      <span className="text-xs text-slate-700 whitespace-nowrap">{s.bairro || '—'}</span>
    ),
  },
  cep: {
    key: 'cep',
    label: 'CEP',
    align: 'left',
    render: (s) => (
      <span className="font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
        {s.cep || '—'}
      </span>
    ),
  },
  regiao: {
    key: 'regiao',
    label: 'Região',
    align: 'left',
    render: (s) => (
      <span className="text-xs font-medium text-slate-700 whitespace-nowrap">{s.regiao || '—'}</span>
    ),
  },
  gerenteResponsavel: {
    key: 'gerenteResponsavel',
    label: 'Gerente Responsável',
    align: 'left',
    render: (s) => (
      <span className="text-xs text-slate-800 whitespace-nowrap">{s.gerenteResponsavel || '—'}</span>
    ),
  },
  ramal: {
    key: 'ramal',
    label: 'Ramal',
    align: 'left',
    render: (s) => (
      <span className="font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
        {s.ramal || '—'}
      </span>
    ),
  },
  telComerciais: {
    key: 'telComerciais',
    label: 'Tel. Comerciais',
    align: 'left',
    render: (s) => (
      <span className="font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
        {s.telComerciais || '—'}
      </span>
    ),
  },
  regionalResponsavel: {
    key: 'regionalResponsavel',
    label: 'Regional',
    align: 'left',
    render: (s) => (
      <span className="text-xs text-slate-700 whitespace-nowrap">{s.regionalResponsavel || '—'}</span>
    ),
  },
  abreDom: {
    key: 'abreDom',
    label: 'Abre Dom?',
    align: 'center',
    render: (s) => (s.abreDom ? renderStatusText(s.abreDom) : <span className="font-mono text-xs text-slate-400">—</span>),
  },
  horarioSemana: {
    key: 'horarioSemana',
    label: 'Semana',
    align: 'left',
    render: (s) => (
      <span className="font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
        {s.horarioSemana || '—'}
      </span>
    ),
  },
  horarioSabado: {
    key: 'horarioSabado',
    label: 'Sábado',
    align: 'left',
    render: (s) => (
      <span className="font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
        {s.horarioSabado || '—'}
      </span>
    ),
  },
  horarioDomingo: {
    key: 'horarioDomingo',
    label: 'Domingo',
    align: 'left',
    render: (s) => (
      <span className="font-mono text-xs text-slate-700 tabular-nums whitespace-nowrap">
        {s.horarioDomingo || '—'}
      </span>
    ),
  },
  cnpj: {
    key: 'cnpj',
    label: 'CNPJ',
    align: 'left',
    render: (s) => (
      <span className="font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
        {s.cnpj}
      </span>
    ),
  },
  tipoLoja: {
    key: 'tipoLoja',
    label: 'Tipo',
    sortKey: 'tipoLoja',
    align: 'left',
    render: (s) => (
      <span
        className={`text-xs font-medium whitespace-nowrap ${
          s.tipoLoja === 'RUA'
            ? 'text-blue-700'
            : s.tipoLoja === 'CD'
            ? 'text-amber-700'
            : s.tipoLoja === 'ESCRITÓRIO'
            ? 'text-emerald-700'
            : 'text-slate-700'
        }`}
      >
        {s.tipoLoja}
      </span>
    ),
  },
  areaTotal: {
    key: 'areaTotal',
    label: 'Área Física (m²)',
    sortKey: 'areaTotal',
    align: 'right',
    render: (s) => <span className="font-mono text-xs font-medium text-slate-900 tabular-nums">{formatArea(s.areaTotal)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.areaTotal || 0), 0)),
  },
  areaVendas: {
    key: 'areaVendas',
    label: 'Área Vendas (m²)',
    sortKey: 'areaVendas',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-800 tabular-nums">{formatArea(s.areaVendas)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.areaVendas || 0), 0)),
  },
  copa: {
    key: 'copa',
    label: 'Copa',
    sortKey: 'copa',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.copa)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.copa || 0), 0)),
  },
  salaTi: {
    key: 'salaTi',
    label: 'Sala TI',
    sortKey: 'salaTi',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.salaTi)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.salaTi || 0), 0)),
  },
  salaVm: {
    key: 'salaVm',
    label: 'Sala VM',
    sortKey: 'salaVm',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.salaVm)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.salaVm || 0), 0)),
  },
  almox: {
    key: 'almox',
    label: 'Almox.',
    sortKey: 'almox',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.almox)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.almox || 0), 0)),
  },
  casaMaq: {
    key: 'casaMaq',
    label: 'Casa Máq.',
    sortKey: 'casaMaq',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.casaMaq)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.casaMaq || 0), 0)),
  },
  subestacao: {
    key: 'subestacao',
    label: 'Subestação',
    sortKey: 'subestacao',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.subestacao)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.subestacao || 0), 0)),
  },
  deposito: {
    key: 'deposito',
    label: 'Depósito',
    sortKey: 'deposito',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.deposito)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.deposito || 0), 0)),
  },
  sanitFem: {
    key: 'sanitFem',
    label: 'Sanit. Fem.',
    sortKey: 'sanitFem',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.sanitFem)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.sanitFem || 0), 0)),
  },
  sanitMasc: {
    key: 'sanitMasc',
    label: 'Sanit. Masc.',
    sortKey: 'sanitMasc',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.sanitMasc)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.sanitMasc || 0), 0)),
  },
  sanitPne: {
    key: 'sanitPne',
    label: 'San. PNE',
    sortKey: 'sanitPne',
    align: 'right',
    render: (s) =>
      s.sanitPneObs ? (
        <span className="font-mono text-xs text-amber-700 tabular-nums" title={s.sanitPneObs}>
          {s.sanitPne !== null ? `${formatArea(s.sanitPne)} (${s.sanitPneObs})` : s.sanitPneObs}
        </span>
      ) : (
        <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.sanitPne)}</span>
      ),
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.sanitPne || 0), 0)),
  },
  areaTecnica: {
    key: 'areaTecnica',
    label: 'Área Téc. Útil',
    sortKey: 'areaTecnica',
    align: 'right',
    render: (s) => <span className="font-mono text-xs font-medium text-slate-900 tabular-nums">{formatArea(s.areaTecnica)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.areaTecnica || 0), 0)),
  },
  areaTerreo: {
    key: 'areaTerreo',
    label: 'Térreo',
    sortKey: 'areaTerreo',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.areaTerreo)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.areaTerreo || 0), 0)),
  },
  areaMezanino: {
    key: 'areaMezanino',
    label: 'Mezanino',
    sortKey: 'areaMezanino',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.areaMezanino)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.areaMezanino || 0), 0)),
  },
  area1Pav: {
    key: 'area1Pav',
    label: '1º Pav.',
    sortKey: 'area1Pav',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.area1Pav)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.area1Pav || 0), 0)),
  },
  area2Pav: {
    key: 'area2Pav',
    label: '2º Pav.',
    sortKey: 'area2Pav',
    align: 'right',
    render: (s) => <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.area2Pav)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.area2Pav || 0), 0)),
  },
  areaTotalConstruida: {
    key: 'areaTotalConstruida',
    label: 'Total Const.',
    sortKey: 'areaTotalConstruida',
    align: 'right',
    render: (s) => <span className="font-mono text-xs font-medium text-slate-900 tabular-nums">{formatArea(s.areaTotalConstruida)}</span>,
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.areaTotalConstruida || 0), 0)),
  },
  estacionamento: {
    key: 'estacionamento',
    label: 'Estacionamento',
    sortKey: 'estacionamento',
    align: 'right',
    render: (s) =>
      s.estacionamentoObs ? (
        <span className="font-mono text-xs text-amber-700">{s.estacionamentoObs}</span>
      ) : (
        <span className="font-mono text-xs text-slate-700 tabular-nums">{formatArea(s.estacionamento)}</span>
      ),
    totalValue: (list) => formatArea(list.reduce((a, x) => a + (x.estacionamento || 0), 0)),
  },
  escadaRolante: {
    key: 'escadaRolante',
    label: 'Esc. Rolante',
    align: 'center',
    render: (s) => renderStatusText(s.escadaRolante),
  },
  escada: {
    key: 'escada',
    label: 'Escada',
    align: 'center',
    render: (s) => renderStatusText(s.escada),
  },
  elevador: {
    key: 'elevador',
    label: 'Elevador',
    align: 'center',
    render: (s) => renderStatusText(s.elevador),
  },
  plataformaPne: {
    key: 'plataformaPne',
    label: 'Plat. PNE',
    align: 'center',
    render: (s) => renderStatusText(s.plataformaPne),
  },
  acSplit: {
    key: 'acSplit',
    label: 'Split',
    sortKey: 'acSplit',
    align: 'right',
    render: (s) => (
      <span className="font-mono text-xs text-slate-800 tabular-nums">
        {formatCount(s.acSplit)}
      </span>
    ),
    totalValue: (list) => formatCount(list.reduce((a, x) => a + (x.acSplit || 0), 0)),
  },
  acSplitaoSelf: {
    key: 'acSplitaoSelf',
    label: 'Splitão/Self',
    sortKey: 'acSplitaoSelf',
    align: 'right',
    render: (s) => (
      <span className="font-mono text-xs text-slate-800 tabular-nums">
        {formatCount(s.acSplitaoSelf)}
      </span>
    ),
    totalValue: (list) => formatCount(list.reduce((a, x) => a + (x.acSplitaoSelf || 0), 0)),
  },
  acFancoil: {
    key: 'acFancoil',
    label: 'Fancoil',
    sortKey: 'acFancoil',
    align: 'right',
    render: (s) => (
      <span className="font-mono text-xs text-slate-800 tabular-nums">
        {formatCount(s.acFancoil)}
      </span>
    ),
    totalValue: (list) => formatCount(list.reduce((a, x) => a + (x.acFancoil || 0), 0)),
  },
  acVrf: {
    key: 'acVrf',
    label: 'VRF',
    sortKey: 'acVrf',
    align: 'right',
    render: (s) => (
      <span className="font-mono text-xs text-slate-800 tabular-nums">
        {formatCount(s.acVrf)}
      </span>
    ),
    totalValue: (list) => formatCount(list.reduce((a, x) => a + (x.acVrf || 0), 0)),
  },
  acTotal: {
    key: 'acTotal',
    label: 'Total AC',
    sortKey: 'acTotal',
    align: 'right',
    render: (s) => {
      const total = getStoreAcTotal(s);
      return (
        <span
          className={`font-mono text-xs tabular-nums ${
            total && total > 0 ? 'font-semibold text-blue-700' : 'text-slate-400'
          }`}
        >
          {formatCount(total)}
        </span>
      );
    },
    totalValue: (list) =>
      formatCount(list.reduce((a, x) => a + (getStoreAcTotal(x) || 0), 0)),
  },
};

const GROUP_COLUMNS: Record<ColumnGroupKey, string[]> = {
  geral: [
    'cidade',
    'tipoLoja',
    'areaTotal',
    'areaVendas',
    'areaTecnica',
    'acTotal',
    'estacionamento',
    'elevador',
    'plataformaPne',
  ],
  contatos: [
    'cidade',
    'bairro',
    'cep',
    'regiao',
    'gerenteResponsavel',
    'ramal',
    'telComerciais',
    'regionalResponsavel',
    'abreDom',
    'horarioSemana',
    'horarioSabado',
    'horarioDomingo',
    'cnpj',
  ],
  retaguarda: [
    'tipoLoja',
    'copa',
    'salaTi',
    'salaVm',
    'almox',
    'casaMaq',
    'subestacao',
    'deposito',
    'sanitFem',
    'sanitMasc',
    'sanitPne',
    'areaTecnica',
  ],
  pavimentos: [
    'cidade',
    'tipoLoja',
    'areaTerreo',
    'areaMezanino',
    'area1Pav',
    'area2Pav',
    'areaTotalConstruida',
    'areaTotal',
    'estacionamento',
  ],
  acessos: [
    'cidade',
    'tipoLoja',
    'areaMezanino',
    'area1Pav',
    'area2Pav',
    'escadaRolante',
    'escada',
    'elevador',
    'plataformaPne',
  ],
  arCondicionado: [
    'cidade',
    'tipoLoja',
    'acSplit',
    'acSplitaoSelf',
    'acFancoil',
    'acVrf',
    'acTotal',
    'casaMaq',
    'areaTotal',
  ],
  completa: [
    'cidade',
    'bairro',
    'endereco',
    'cep',
    'regiao',
    'cnpj',
    'tipoLoja',
    'gerenteResponsavel',
    'ramal',
    'telComerciais',
    'regionalResponsavel',
    'abreDom',
    'horarioSemana',
    'horarioSabado',
    'horarioDomingo',
    'areaTotal',
    'areaVendas',
    'copa',
    'salaTi',
    'salaVm',
    'almox',
    'casaMaq',
    'subestacao',
    'deposito',
    'sanitFem',
    'sanitMasc',
    'sanitPne',
    'areaTecnica',
    'areaTerreo',
    'areaMezanino',
    'area1Pav',
    'area2Pav',
    'areaTotalConstruida',
    'estacionamento',
    'escadaRolante',
    'escada',
    'elevador',
    'plataformaPne',
    'acSplit',
    'acSplitaoSelf',
    'acFancoil',
    'acVrf',
    'acTotal',
  ],
};

export function StoreDataTable({
  stores,
  columnGroup,
  sortField,
  sortDirection,
  onSort,
  onSelectStore,
  onEditStore,
  onResetFilters,
}: StoreDataTableProps) {
  const columns = GROUP_COLUMNS[columnGroup].map((key) => NUMERIC_COLUMNS[key]);

  if (stores.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg p-12 text-center">
        <p className="text-base font-semibold text-slate-900">
          Nenhuma unidade encontrada com os filtros atuais
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Ajuste os critérios de busca por número, cidade, CNPJ ou indicador técnico.
        </p>
        <button
          type="button"
          onClick={onResetFilters}
          className="mt-4 px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors cursor-pointer"
        >
          Restaurar todos os filtros
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="overflow-x-auto engineering-scroll">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200">
              <th className="sticky left-0 z-20 bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap border-r border-slate-200">
                <button
                  type="button"
                  onClick={() => onSort('numero')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Nº</span>
                  {sortField === 'numero' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-blue-700" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-blue-700" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </th>
              <th className="sticky left-[58px] z-20 bg-slate-100 px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap border-r border-slate-200 min-w-[210px]">
                <button
                  type="button"
                  onClick={() => onSort('nome')}
                  className="inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer"
                >
                  <span>Unidade</span>
                  {sortField === 'nome' ? (
                    sortDirection === 'asc' ? (
                      <ArrowUp className="w-3 h-3 text-blue-700" />
                    ) : (
                      <ArrowDown className="w-3 h-3 text-blue-700" />
                    )
                  ) : (
                    <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  )}
                </button>
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-3 py-2.5 text-xs font-semibold text-slate-700 whitespace-nowrap ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.sortKey ? (
                    <button
                      type="button"
                      onClick={() => onSort(col.sortKey!)}
                      className={`inline-flex items-center gap-1 hover:text-slate-900 cursor-pointer ${
                        col.align === 'right' ? 'flex-row-reverse' : ''
                      }`}
                    >
                      <span>{col.label}</span>
                      {sortField === col.sortKey ? (
                        sortDirection === 'asc' ? (
                          <ArrowUp className="w-3 h-3 text-blue-700" />
                        ) : (
                          <ArrowDown className="w-3 h-3 text-blue-700" />
                        )
                      ) : (
                        <ArrowUpDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  ) : (
                    col.label
                  )}
                </th>
              ))}
              <th className="px-3 py-2.5 text-xs font-semibold text-slate-700 text-right whitespace-nowrap">
                Ações
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {stores.map((store) => (
              <tr
                key={store.id ?? store.numero}
                onClick={() => onSelectStore(store)}
                className="group hover:bg-blue-50/50 transition-colors cursor-pointer"
              >
                <td className="sticky left-0 z-10 bg-white group-hover:bg-blue-50/50 px-3 py-2.5 font-mono text-xs font-semibold text-slate-900 tabular-nums border-r border-slate-100 whitespace-nowrap w-[58px]">
                  {store.numero}
                </td>
                <td className="sticky left-[58px] z-10 bg-white group-hover:bg-blue-50/50 px-3 py-2.5 text-xs font-medium text-slate-900 border-r border-slate-100 whitespace-nowrap max-w-[240px] truncate">
                  {store.nome}
                </td>
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className={`px-3 py-2.5 whitespace-nowrap ${
                      col.align === 'right'
                        ? 'text-right'
                        : col.align === 'center'
                        ? 'text-center'
                        : 'text-left'
                    }`}
                  >
                    {col.render(store)}
                  </td>
                ))}
                <td
                  className="px-3 py-2.5 text-right whitespace-nowrap"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="inline-flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => onSelectStore(store)}
                      title="Ver ficha completa (29 indicadores)"
                      aria-label={`Ver ficha da loja ${store.numero}`}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditStore(store)}
                      title="Editar indicadores"
                      aria-label={`Editar loja ${store.numero}`}
                      className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

          <tfoot>
            <tr className="bg-slate-100 border-t-2 border-slate-300 font-semibold">
              <td className="sticky left-0 z-10 bg-slate-100 px-3 py-2.5 text-xs font-mono text-slate-900 border-r border-slate-200 whitespace-nowrap">
                {stores.length}
              </td>
              <td className="sticky left-[58px] z-10 bg-slate-100 px-3 py-2.5 text-xs text-slate-900 border-r border-slate-200 whitespace-nowrap">
                TOTAIS DA SELEÇÃO
              </td>
              {columns.map((col) => (
                <td
                  key={col.key}
                  className={`px-3 py-2.5 font-mono text-xs text-slate-900 tabular-nums whitespace-nowrap ${
                    col.align === 'right'
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left'
                  }`}
                >
                  {col.totalValue ? col.totalValue(stores) : ''}
                </td>
              ))}
              <td className="px-3 py-2.5" />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
