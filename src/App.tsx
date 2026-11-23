import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FilterToolbar } from './components/FilterToolbar.tsx';
import { HomeLauncherView } from './components/HomeLauncherView.tsx';
import { IndicatorsAnalyticsView } from './components/IndicatorsAnalyticsView.tsx';
import { InfrastructureMatrixView } from './components/InfrastructureMatrixView.tsx';
import { KpiSummaryStrip } from './components/KpiSummaryStrip.tsx';
import { StoreComparisonView } from './components/StoreComparisonView.tsx';
import { StoreDataTable } from './components/StoreDataTable.tsx';
import { StoreDetailDrawer } from './components/StoreDetailDrawer.tsx';
import { StoreFormModal } from './components/StoreFormModal.tsx';
import { TopBar } from './components/TopBar.tsx';
import {
  createStore,
  deleteStore,
  exportStoresToCsv,
  fetchStores,
  getStoreAcTotal,
  getStoreKey,
  normalizeText,
  resetStoresBaseline,
  updateStore,
} from './services/storeApi.ts';
import type {
  ActiveTab,
  ColumnGroupKey,
  FilterState,
  SortDirection,
  SortField,
  StoreAreaRecord,
} from './types/store.ts';

const DEFAULT_FILTERS: FilterState = {
  search: '',
  estado: 'ALL',
  tipoLoja: 'ALL',
  infraFilter: 'all',
};

export default function App() {
  const [stores, setStores] = useState<StoreAreaRecord[]>([]);
  const [lastModified, setLastModified] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState<ActiveTab>('inicio');
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);
  const [columnGroup, setColumnGroup] = useState<ColumnGroupKey>('geral');
  const [sortField, setSortField] = useState<SortField>('numero');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [selectedStore, setSelectedStore] = useState<StoreAreaRecord | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreAreaRecord | null>(null);
  const [compareIds, setCompareIds] = useState<string[]>(['1085', '1029', '1180']);
  const [confirmReset, setConfirmReset] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchStores();
      setStores(data.stores);
      setLastModified(data.lastModified);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!feedbackMessage) return;
    const timer = window.setTimeout(() => setFeedbackMessage(null), 4000);
    return () => window.clearTimeout(timer);
  }, [feedbackMessage]);

  const availableStates = useMemo(() => {
    const set = new Set<string>();
    for (const s of stores) {
      if (s.estado) set.add(s.estado);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [stores]);

  const filteredAndSortedStores = useMemo(() => {
    const q = normalizeText(filters.search);

    const filtered = stores.filter((s) => {
      if (filters.estado !== 'ALL' && s.estado !== filters.estado) return false;
      if (filters.tipoLoja !== 'ALL' && s.tipoLoja !== filters.tipoLoja) return false;

      switch (filters.infraFilter) {
        case 'elevador':
          if (!s.elevador.toUpperCase().includes('SIM')) return false;
          break;
        case 'plataformaPne':
          if (!s.plataformaPne.toUpperCase().includes('SIM')) return false;
          break;
        case 'escadaRolante':
          if (!s.escadaRolante.toUpperCase().includes('SIM')) return false;
          break;
        case 'subestacao':
          if (!(s.subestacao && s.subestacao > 0)) return false;
          break;
        case 'casaMaq':
          if (!(s.casaMaq && s.casaMaq > 0)) return false;
          break;
        case 'mezanino':
          if (!(s.areaMezanino && s.areaMezanino > 0)) return false;
          break;
        case 'estacionamento':
          if (!(s.estacionamento && s.estacionamento > 0) && !s.estacionamentoObs) return false;
          break;
        case 'arCondicionado':
          if (!((getStoreAcTotal(s) ?? 0) > 0)) return false;
          break;
        case 'acSplit':
          if (!((s.acSplit ?? 0) > 0)) return false;
          break;
        case 'acSplitaoSelf':
          if (!((s.acSplitaoSelf ?? 0) > 0)) return false;
          break;
        case 'acFancoil':
          if (!((s.acFancoil ?? 0) > 0)) return false;
          break;
        case 'acVrf':
          if (!((s.acVrf ?? 0) > 0)) return false;
          break;
        case 'comObs': {
          const hasAnyObs =
            Boolean(s.sanitPneObs) ||
            Boolean(s.estacionamentoObs) ||
            Boolean(s.observacoes) ||
            s.escada.includes('*') ||
            s.elevador.includes('*') ||
            s.plataformaPne.includes('*');
          if (!hasAnyObs) return false;
          break;
        }
      }

      if (!q) return true;

      // Pesquisa rápida abrangente: dados cadastrais + palavras-chave dos indicadores ativos
      const searchableTokens = [
        s.numero,
        s.nome,
        s.cidade,
        s.estado,
        s.endereco || '',
        s.bairro || '',
        s.cep || '',
        s.regiao || '',
        s.cnpj,
        s.tipoLoja,
        s.gerenteResponsavel || '',
        s.regionalResponsavel || '',
        s.ramal || '',
        s.telComerciais || '',
        s.observacoes || '',
        s.sanitPneObs || '',
        s.estacionamentoObs || '',
        s.subestacao ? 'subestacao' : '',
        s.casaMaq ? 'casa de maquinas casa maq' : '',
        s.salaTi ? 'sala ti' : '',
        s.salaVm ? 'sala vm' : '',
        s.almox ? 'almoxarifado almox' : '',
        s.deposito ? 'deposito' : '',
        s.areaMezanino ? 'mezanino' : '',
        s.area1Pav ? '1 pavimento' : '',
        s.area2Pav ? '2 pavimento' : '',
        s.estacionamento ? 'estacionamento' : '',
        s.elevador.toUpperCase().includes('SIM') ? 'elevador' : '',
        s.escadaRolante.toUpperCase().includes('SIM') ? 'escada rolante' : '',
        s.plataformaPne.toUpperCase().includes('SIM') ? 'plataforma pne' : '',
        (getStoreAcTotal(s) ?? 0) > 0 ? 'ar condicionado climatizacao' : '',
        (s.acSplit ?? 0) > 0 ? 'split' : '',
        (s.acSplitaoSelf ?? 0) > 0 ? 'splitao self' : '',
        (s.acFancoil ?? 0) > 0 ? 'fancoil' : '',
        (s.acVrf ?? 0) > 0 ? 'vrf' : '',
      ];

      return searchableTokens.some((tok) => normalizeText(tok).includes(q));
    });

    return [...filtered].sort((a, b) => {
      if (sortField === 'acTotal') {
        const numA = getStoreAcTotal(a) ?? -1;
        const numB = getStoreAcTotal(b) ?? -1;
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      const valA = a[sortField];
      const valB = b[sortField];

      if (sortField === 'numero') {
        const cmp = a.numero.localeCompare(b.numero, 'pt-BR', { numeric: true });
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      if (
        sortField === 'nome' ||
        sortField === 'cidade' ||
        sortField === 'estado' ||
        sortField === 'tipoLoja'
      ) {
        const cmp = String(valA ?? '').localeCompare(String(valB ?? ''), 'pt-BR');
        return sortDirection === 'asc' ? cmp : -cmp;
      }

      const numA = typeof valA === 'number' ? valA : -1;
      const numB = typeof valB === 'number' ? valB : -1;
      return sortDirection === 'asc' ? numA - numB : numB - numA;
    });
  }, [stores, filters, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection(field === 'numero' || field === 'nome' || field === 'cidade' ? 'asc' : 'desc');
    }
  };

  const handleOpenAdd = () => {
    setEditingStore(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (store: StoreAreaRecord) => {
    setEditingStore(store);
    setFormOpen(true);
  };

  const handleSaveStore = async (payload: StoreAreaRecord, isEdit: boolean) => {
    if (isEdit) {
      const key = getStoreKey(payload);
      const res = await updateStore(key, payload);
      const savedKey = getStoreKey(res.store);
      setStores((prev) =>
        prev.map((item) => (getStoreKey(item) === savedKey ? res.store : item)),
      );
      setLastModified(res.lastModified);
      if (selectedStore && getStoreKey(selectedStore) === savedKey) {
        setSelectedStore(res.store);
      }
      setFeedbackMessage(`Unidade ${res.store.numero} (${res.store.nome}) atualizada.`);
    } else {
      const res = await createStore(payload);
      setStores((prev) =>
        [...prev, res.store].sort((a, b) =>
          a.numero.localeCompare(b.numero, 'pt-BR', { numeric: true }),
        ),
      );
      setLastModified(res.lastModified);
      setFeedbackMessage(`Unidade ${res.store.numero} (${res.store.nome}) cadastrada.`);
    }
  };

  const handleDeleteStore = async (storeKey: string) => {
    const res = await deleteStore(storeKey);
    setStores((prev) => prev.filter((s) => getStoreKey(s) !== storeKey));
    setLastModified(res.lastModified);
    setSelectedStore(null);
    setCompareIds((prev) => prev.filter((id) => id !== storeKey));
    setFeedbackMessage(`Unidade ${storeKey} removida da base.`);
  };

  const handleResetBaseline = async () => {
    const res = await resetStoresBaseline();
    setStores(res.stores);
    setLastModified(res.lastModified);
    setConfirmReset(false);
    setSelectedStore(null);
    setFeedbackMessage('Base restaurada para o consolidado original do documento.');
  };

  const handleAddToCompare = (storeKey: string) => {
    setCompareIds((prev) => {
      if (prev.includes(storeKey)) return prev;
      if (prev.length >= 4) return [...prev.slice(1), storeKey];
      return [...prev, storeKey];
    });
    setSelectedStore(null);
    setActiveTab('comparativo');
  };

  if (activeTab === 'inicio') {
    return (
      <>
        <HomeLauncherView
          stores={stores}
          statesCount={availableStates.length}
          onNavigate={setActiveTab}
          onAddStore={handleOpenAdd}
        />

        <StoreFormModal
          isOpen={formOpen}
          editingStore={editingStore}
          onClose={() => {
            setFormOpen(false);
            setEditingStore(null);
          }}
          onSubmit={handleSaveStore}
        />
      </>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <TopBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onAddStore={handleOpenAdd}
      />

      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 sm:px-6 py-6 space-y-5">
        {/* Cabeçalho de contexto da Engenharia e Manutenção */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Engenharia e Manutenção STZ
            </h1>
            <p className="mt-0.5 text-sm text-slate-600">
              Consulta rápida de indicadores físicos, áreas técnicas, climatização, pavimentos e acessibilidade das unidades consolidadas.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {lastModified && (
              <p className="text-xs text-slate-500 font-mono tabular-nums whitespace-nowrap">
                Atualizado em {new Date(lastModified).toLocaleString('pt-BR')}
              </p>
            )}
          </div>
        </div>

        {feedbackMessage && (
          <div
            role="status"
            className="px-4 py-2.5 bg-emerald-50 border border-emerald-200 rounded-md text-xs font-medium text-emerald-900 flex items-center justify-between"
          >
            <span>{feedbackMessage}</span>
            <button
              type="button"
              onClick={() => setFeedbackMessage(null)}
              className="text-emerald-700 hover:text-emerald-950 font-semibold cursor-pointer"
            >
              Fechar
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="p-4 bg-rose-50 border border-rose-200 rounded-lg flex items-center justify-between gap-4"
          >
            <p className="text-sm text-rose-800">{error}</p>
            <button
              type="button"
              onClick={loadData}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded cursor-pointer"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4" aria-busy="true" aria-label="Carregando base consolidada">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[0, 1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-24 bg-white border border-slate-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
            <div className="h-96 bg-white border border-slate-200 rounded-lg animate-pulse" />
          </div>
        ) : (
          <>
            {activeTab === 'base' && (
              <div className="space-y-4">
                <KpiSummaryStrip
                  filteredStores={filteredAndSortedStores}
                  totalStoresCount={stores.length}
                />

                <FilterToolbar
                  filters={filters}
                  onFiltersChange={setFilters}
                  availableStates={availableStates}
                  columnGroup={columnGroup}
                  onColumnGroupChange={setColumnGroup}
                  onExportCsv={() => exportStoresToCsv(filteredAndSortedStores)}
                  onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                />

                <StoreDataTable
                  stores={filteredAndSortedStores}
                  columnGroup={columnGroup}
                  sortField={sortField}
                  sortDirection={sortDirection}
                  onSort={handleSort}
                  onSelectStore={setSelectedStore}
                  onEditStore={handleOpenEdit}
                  onResetFilters={() => setFilters(DEFAULT_FILTERS)}
                />
              </div>
            )}

            {activeTab === 'indicadores' && (
              <IndicatorsAnalyticsView
                stores={stores}
                onSelectStore={setSelectedStore}
                onFilterByState={(uf) => {
                  setFilters({ ...DEFAULT_FILTERS, estado: uf });
                  setActiveTab('base');
                }}
              />
            )}

            {activeTab === 'comparativo' && (
              <StoreComparisonView
                stores={stores}
                selectedIds={compareIds}
                onChangeSelectedIds={setCompareIds}
                onSelectStore={setSelectedStore}
              />
            )}

            {activeTab === 'infraestrutura' && (
              <InfrastructureMatrixView
                stores={stores}
                onSelectStore={setSelectedStore}
                onEditStore={handleOpenEdit}
              />
            )}
          </>
        )}
      </main>

      <footer className="border-t border-slate-200 bg-white mt-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500">
          <span>stz - areas consolidadas · Engenharia e Manutenção</span>
          <div className="flex items-center gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-1.5 text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar base original (114 unidades)</span>
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="text-amber-800 font-medium">
                  Restaurar os 114 registros originais do documento?
                </span>
                <button
                  type="button"
                  onClick={handleResetBaseline}
                  className="px-2 py-1 text-xs font-semibold text-white bg-amber-700 hover:bg-amber-800 rounded cursor-pointer"
                >
                  Confirmar
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-2 py-1 text-xs text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            )}
          </div>
        </div>
      </footer>

      <StoreDetailDrawer
        store={selectedStore}
        onClose={() => setSelectedStore(null)}
        onEdit={(store) => {
          setSelectedStore(null);
          handleOpenEdit(store);
        }}
        onDelete={handleDeleteStore}
        onAddToCompare={handleAddToCompare}
      />

      <StoreFormModal
        isOpen={formOpen}
        editingStore={editingStore}
        onClose={() => {
          setFormOpen(false);
          setEditingStore(null);
        }}
        onSubmit={handleSaveStore}
      />
    </div>
  );
}
