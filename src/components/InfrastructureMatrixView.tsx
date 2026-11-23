import { Pencil } from 'lucide-react';
import { useMemo, useState } from 'react';
import { formatArea, formatCount, getStoreAcTotal } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface InfrastructureMatrixViewProps {
  stores: StoreAreaRecord[];
  onSelectStore: (store: StoreAreaRecord) => void;
  onEditStore: (store: StoreAreaRecord) => void;
}

type AssetFocus =
  | 'arCondicionado'
  | 'subestacao'
  | 'casaMaq'
  | 'elevador'
  | 'plataformaPne'
  | 'escadaRolante'
  | 'observacoes';

const FOCUS_TABS: { id: AssetFocus; label: string }[] = [
  { id: 'arCondicionado', label: 'Ar Condicionado' },
  { id: 'subestacao', label: 'Subestações' },
  { id: 'casaMaq', label: 'Casas de Máquinas' },
  { id: 'elevador', label: 'Elevadores' },
  { id: 'plataformaPne', label: 'Plataformas PNE' },
  { id: 'escadaRolante', label: 'Escadas Rolantes' },
  { id: 'observacoes', label: 'Pendências / *obs' },
];

function hasObs(s: StoreAreaRecord): boolean {
  return (
    Boolean(s.sanitPneObs) ||
    Boolean(s.estacionamentoObs) ||
    Boolean(s.observacoes) ||
    s.escada.includes('*') ||
    s.elevador.includes('*') ||
    s.plataformaPne.includes('*') ||
    s.escadaRolante.includes('*')
  );
}

export function InfrastructureMatrixView({
  stores,
  onSelectStore,
  onEditStore,
}: InfrastructureMatrixViewProps) {
  const [focus, setFocus] = useState<AssetFocus>('arCondicionado');

  const counts = useMemo(
    () => ({
      arCondicionado: stores.filter((s) => (getStoreAcTotal(s) ?? 0) > 0).length,
      subestacao: stores.filter((s) => (s.subestacao ?? 0) > 0).length,
      casaMaq: stores.filter((s) => (s.casaMaq ?? 0) > 0).length,
      elevador: stores.filter((s) => s.elevador.toUpperCase().includes('SIM') || s.elevador === '*obs').length,
      plataformaPne: stores.filter((s) => s.plataformaPne.toUpperCase().includes('SIM') || s.plataformaPne === '*obs').length,
      escadaRolante: stores.filter((s) => s.escadaRolante.toUpperCase().includes('SIM')).length,
      observacoes: stores.filter(hasObs).length,
    }),
    [stores],
  );

  const filteredList = useMemo(() => {
    switch (focus) {
      case 'arCondicionado':
        return stores.filter((s) => (getStoreAcTotal(s) ?? 0) > 0);
      case 'subestacao':
        return stores.filter((s) => (s.subestacao ?? 0) > 0);
      case 'casaMaq':
        return stores.filter((s) => (s.casaMaq ?? 0) > 0);
      case 'elevador':
        return stores.filter((s) => s.elevador.toUpperCase().includes('SIM') || s.elevador === '*obs');
      case 'plataformaPne':
        return stores.filter((s) => s.plataformaPne.toUpperCase().includes('SIM') || s.plataformaPne === '*obs');
      case 'escadaRolante':
        return stores.filter((s) => s.escadaRolante.toUpperCase().includes('SIM'));
      case 'observacoes':
        return stores.filter(hasObs);
    }
  }, [stores, focus]);

  return (
    <div className="space-y-4">
      <section className="bg-white border border-slate-200 rounded-lg p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Matriz de Infraestrutura e Manutenção STZ
            </h2>
            <p className="text-xs text-slate-500">
              Consulta rápida de ativos críticos para planos de manutenção preventiva, elétrica e mobilidade vertical.
            </p>
          </div>
          <span className="font-mono text-xs text-slate-600 tabular-nums">
            {filteredList.length} unidades neste recorte
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-md w-fit">
          {FOCUS_TABS.map((tab) => {
            const active = focus === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFocus(tab.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  active
                    ? 'bg-white text-blue-700 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}{' '}
                <span className="ml-1 font-mono text-[11px] opacity-75">
                  ({counts[tab.id]})
                </span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-xs font-semibold text-slate-700">
                <th className="px-4 py-2.5">Nº</th>
                <th className="px-4 py-2.5">Unidade</th>
                <th className="px-4 py-2.5">Cidade · UF</th>
                <th className="px-4 py-2.5">Tipo</th>
                <th className="px-4 py-2.5 text-right">Split</th>
                <th className="px-4 py-2.5 text-right">Splitão/Self</th>
                <th className="px-4 py-2.5 text-right">Fancoil</th>
                <th className="px-4 py-2.5 text-right">VRF</th>
                <th className="px-4 py-2.5 text-right">Total AC</th>
                <th className="px-4 py-2.5 text-right">Subestação</th>
                <th className="px-4 py-2.5 text-right">Casa Máq.</th>
                <th className="px-4 py-2.5 text-center">Elevador</th>
                <th className="px-4 py-2.5 text-center">Plat. PNE</th>
                <th className="px-4 py-2.5">Obs. / Notas</th>
                <th className="px-4 py-2.5 text-right">Editar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredList.map((s) => {
                const acTotal = getStoreAcTotal(s);
                const obsSummary = [
                  s.sanitPneObs ? `San. PNE: ${s.sanitPneObs}` : '',
                  s.estacionamentoObs ? `Estac.: ${s.estacionamentoObs}` : '',
                  s.observacoes || '',
                ]
                  .filter(Boolean)
                  .join(' · ');

                return (
                  <tr
                    key={s.id ?? s.numero}
                    onClick={() => onSelectStore(s)}
                    className="hover:bg-blue-50/50 transition-colors cursor-pointer"
                  >
                    <td className="px-4 py-2.5 font-mono text-xs font-semibold text-blue-700 tabular-nums">
                      {s.numero}
                    </td>
                    <td className="px-4 py-2.5 text-xs font-medium text-slate-900 whitespace-nowrap">
                      {s.nome}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-600 whitespace-nowrap">
                      {s.cidade} · {s.estado}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-slate-700">{s.tipoLoja}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-800 tabular-nums">
                      {formatCount(s.acSplit)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-800 tabular-nums">
                      {formatCount(s.acSplitaoSelf)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-800 tabular-nums">
                      {formatCount(s.acFancoil)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-800 tabular-nums">
                      {formatCount(s.acVrf)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs font-semibold text-blue-700 tabular-nums">
                      {formatCount(acTotal)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-800 tabular-nums">
                      {formatArea(s.subestacao)}
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono text-xs text-slate-800 tabular-nums">
                      {formatArea(s.casaMaq)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-center font-mono text-xs font-semibold ${
                        s.elevador === 'SIM'
                          ? 'text-emerald-700'
                          : s.elevador.includes('*')
                          ? 'text-amber-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.elevador}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-center font-mono text-xs font-semibold ${
                        s.plataformaPne === 'SIM'
                          ? 'text-emerald-700'
                          : s.plataformaPne.includes('*')
                          ? 'text-amber-700'
                          : 'text-slate-400'
                      }`}
                    >
                      {s.plataformaPne}
                    </td>
                    <td className="px-4 py-2.5 text-xs text-amber-800 max-w-[200px] truncate">
                      {obsSummary || '—'}
                    </td>
                    <td
                      className="px-4 py-2.5 text-right"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => onEditStore(s)}
                        aria-label={`Editar infraestrutura da loja ${s.numero}`}
                        className="p-1.5 text-slate-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
