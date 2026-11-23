import { Download, RotateCcw, Search, X } from 'lucide-react';
import type { ColumnGroupKey, FilterState, QuickInfraFilter, TipoLoja } from '../types/store.ts';

interface FilterToolbarProps {
  filters: FilterState;
  onFiltersChange: (next: FilterState) => void;
  availableStates: string[];
  columnGroup: ColumnGroupKey;
  onColumnGroupChange: (group: ColumnGroupKey) => void;
  onExportCsv: () => void;
  onResetFilters: () => void;
}

const COLUMN_GROUPS: { id: ColumnGroupKey; label: string }[] = [
  { id: 'geral', label: 'Visão Geral' },
  { id: 'contatos', label: 'Contatos & Horários' },
  { id: 'retaguarda', label: 'Retaguarda & Téc.' },
  { id: 'pavimentos', label: 'Pavimentos' },
  { id: 'acessos', label: 'Acessos' },
  { id: 'arCondicionado', label: 'Ar Condicionado' },
  { id: 'completa', label: 'Completa' },
];

const INFRA_FILTERS: { id: QuickInfraFilter; label: string }[] = [
  { id: 'all', label: 'Todos os indicadores' },
  { id: 'arCondicionado', label: 'Com Ar Condicionado' },
  { id: 'acSplit', label: 'AC: Com Split' },
  { id: 'acSplitaoSelf', label: 'AC: Com Splitão/Self' },
  { id: 'acFancoil', label: 'AC: Com Fancoil' },
  { id: 'acVrf', label: 'AC: Com VRF' },
  { id: 'elevador', label: 'Com Elevador' },
  { id: 'plataformaPne', label: 'Com Plataforma PNE' },
  { id: 'escadaRolante', label: 'Com Escada Rolante' },
  { id: 'subestacao', label: 'Com Subestação' },
  { id: 'casaMaq', label: 'Com Casa de Máquinas' },
  { id: 'mezanino', label: 'Com Mezanino' },
  { id: 'estacionamento', label: 'Com Estacionamento' },
  { id: 'comObs', label: 'Com Pendência / *obs' },
];

export function FilterToolbar({
  filters,
  onFiltersChange,
  availableStates,
  columnGroup,
  onColumnGroupChange,
  onExportCsv,
  onResetFilters,
}: FilterToolbarProps) {
  const hasActiveFilters =
    filters.search.trim() !== '' ||
    filters.estado !== 'ALL' ||
    filters.tipoLoja !== 'ALL' ||
    filters.infraFilter !== 'all';

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
      {/* Linha 1: Pesquisa rápida + filtros principais */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="relative flex-1 min-w-0">
          <Search
            className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            placeholder="Pesquisa rápida: nº, nome, cidade, UF, gerente, CNPJ, split, fancoil, VRF..."
            aria-label="Pesquisa rápida de unidades e indicadores"
            className="w-full h-10 pl-9 pr-9 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 transition-colors"
          />
          {filters.search && (
            <button
              type="button"
              onClick={() => onFiltersChange({ ...filters, search: '' })}
              aria-label="Limpar pesquisa"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Filtro UF */}
          <select
            value={filters.estado}
            onChange={(e) => onFiltersChange({ ...filters, estado: e.target.value })}
            aria-label="Filtrar por Estado (UF)"
            className="h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            <option value="ALL">Todas as UFs ({availableStates.length})</option>
            {availableStates.map((uf) => (
              <option key={uf} value={uf}>
                UF: {uf}
              </option>
            ))}
          </select>

          {/* Filtro Tipo de Unidade (Segmented) */}
          <div
            role="group"
            aria-label="Filtrar por tipo de unidade"
            className="inline-flex items-center p-1 bg-slate-100 rounded-md overflow-x-auto max-w-full"
          >
            {(
              [
                { id: 'ALL', label: 'Todas' },
                { id: 'RUA', label: 'Rua' },
                { id: 'SHOPPING', label: 'Shopping' },
                { id: 'CD', label: 'CD' },
                { id: 'ESCRITÓRIO', label: 'Escritório' },
              ] as const
            ).map((opt) => {
              const active = filters.tipoLoja === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() =>
                    onFiltersChange({ ...filters, tipoLoja: opt.id as 'ALL' | TipoLoja })
                  }
                  className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>

          {/* Filtro de Infraestrutura / Indicadores */}
          <select
            value={filters.infraFilter}
            onChange={(e) =>
              onFiltersChange({
                ...filters,
                infraFilter: e.target.value as QuickInfraFilter,
              })
            }
            aria-label="Filtrar por indicador técnico"
            className="h-10 px-3 text-sm bg-slate-50 border border-slate-200 rounded-md text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
          >
            {INFRA_FILTERS.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Linha 2: Seletor de blocos de colunas + Exportação */}
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-xs font-medium text-slate-500 whitespace-nowrap shrink-0">
            Bloco de indicadores:
          </span>
          <div
            role="group"
            aria-label="Selecionar grupo de colunas"
            className="inline-flex items-center p-1 bg-slate-100 rounded-md shrink-0"
          >
            {COLUMN_GROUPS.map((grp) => {
              const active = columnGroup === grp.id;
              return (
                <button
                  key={grp.id}
                  type="button"
                  onClick={() => onColumnGroupChange(grp.id)}
                  className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    active
                      ? 'bg-white text-blue-700 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {grp.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
          <button
            type="button"
            onClick={onExportCsv}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>
    </div>
  );
}
