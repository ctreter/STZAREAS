import { formatArea, formatCount, formatPercent, getStoreAcTotal } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface KpiSummaryStripProps {
  filteredStores: StoreAreaRecord[];
  totalStoresCount: number;
}

export function KpiSummaryStrip({ filteredStores, totalStoresCount }: KpiSummaryStripProps) {
  const count = filteredStores.length;
  const ruaCount = filteredStores.filter((s) => s.tipoLoja === 'RUA').length;
  const shoppingCount = filteredStores.filter((s) => s.tipoLoja === 'SHOPPING').length;
  const cdCount = filteredStores.filter((s) => s.tipoLoja === 'CD').length;
  const escritorioCount = filteredStores.filter((s) => s.tipoLoja === 'ESCRITÓRIO').length;

  const totalAreaFisica = filteredStores.reduce((sum, s) => sum + (s.areaTotal || 0), 0);
  const totalAreaVendas = filteredStores.reduce((sum, s) => sum + (s.areaVendas || 0), 0);
  const totalAreaTecnica = filteredStores.reduce((sum, s) => sum + (s.areaTecnica || 0), 0);
  const avgAreaFisica = count > 0 ? totalAreaFisica / count : 0;

  const withElevador = filteredStores.filter((s) => s.elevador.toUpperCase().includes('SIM')).length;
  const withPlataforma = filteredStores.filter((s) => s.plataformaPne.toUpperCase().includes('SIM')).length;
  const withSubestacao = filteredStores.filter((s) => (s.subestacao ?? 0) > 0).length;
  const totalAcEquipments = filteredStores.reduce((sum, s) => sum + (getStoreAcTotal(s) || 0), 0);

  const isFiltered = count !== totalStoresCount;

  return (
    <section
      aria-label="Resumo consolidado de áreas"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-xs font-medium text-slate-500">Unidades na Seleção</p>
        <div className="mt-1.5 flex items-baseline gap-2">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {count}
          </span>
          {isFiltered && (
            <span className="text-xs text-slate-500 font-mono tabular-nums">
              de {totalStoresCount}
            </span>
          )}
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          <span>{ruaCount} Rua</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>{shoppingCount} Shop.</span>
          {cdCount > 0 && (
            <>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>{cdCount} CD</span>
            </>
          )}
          {escritorioCount > 0 && (
            <>
              <span aria-hidden="true" className="mx-1.5">·</span>
              <span>{escritorioCount} Escr.</span>
            </>
          )}
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-xs font-medium text-slate-500">Área Física Total</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatArea(totalAreaFisica)}
          </span>
          <span className="text-xs font-medium text-slate-500">m²</span>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          <span>Média {formatArea(avgAreaFisica, true)} por unidade</span>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-xs font-medium text-slate-500">Área de Vendas Consolidada</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatArea(totalAreaVendas)}
          </span>
          <span className="text-xs font-medium text-slate-500">m²</span>
        </div>
        <p className="mt-1.5 text-xs text-slate-500">
          <span className="font-mono tabular-nums text-emerald-700 font-medium">
            {formatPercent(totalAreaVendas, totalAreaFisica)}
          </span>
          <span> de aproveitamento comercial</span>
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-4">
        <p className="text-xs font-medium text-slate-500">Área Técnica & Climatização</p>
        <div className="mt-1.5 flex items-baseline gap-1.5">
          <span className="text-2xl font-bold text-slate-900 font-mono tabular-nums">
            {formatArea(totalAreaTecnica)}
          </span>
          <span className="text-xs font-medium text-slate-500">m²</span>
        </div>
        <p className="mt-1.5 text-xs text-slate-500 font-mono tabular-nums">
          <span>{formatCount(totalAcEquipments)} equip. AC</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>{withElevador} Elev.</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>{withPlataforma} PNE</span>
          <span aria-hidden="true" className="mx-1.5">·</span>
          <span>{withSubestacao} Sub.</span>
        </p>
      </div>
    </section>
  );
}
