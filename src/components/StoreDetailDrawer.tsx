import {
  ArrowLeftRight,
  Pencil,
  Send,
  Trash2,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import { formatArea, formatCount, formatPercent, getStoreAcTotal, getStoreKey } from '../services/storeApi.ts';
import type { StoreAreaRecord } from '../types/store.ts';

interface StoreDetailDrawerProps {
  store: StoreAreaRecord | null;
  onClose: () => void;
  onEdit: (store: StoreAreaRecord) => void;
  onDelete: (numero: string) => Promise<void>;
  onAddToCompare: (numero: string) => void;
}

function MetricRow({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-600 shrink-0">{label}</span>
      <span
        className={`font-mono text-xs tabular-nums text-right ${
          highlight ? 'font-semibold text-slate-900' : 'text-slate-800'
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function TextRow({ label, value }: { label: string; value?: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-600 shrink-0">{label}</span>
      <span className="text-xs text-slate-800 text-right">{value?.trim() || '—'}</span>
    </div>
  );
}

function AccessStatusRow({ label, status }: { label: string; status: string }) {
  const upper = status.trim().toUpperCase();
  const colorClass =
    upper === 'SIM'
      ? 'text-emerald-700 font-semibold'
      : upper === 'SIM*' || upper === '*OBS'
      ? 'text-amber-700 font-semibold'
      : upper === 'NÃO' || upper === 'NAO'
      ? 'text-rose-700 font-semibold'
      : 'text-slate-400';

  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
      <span className="text-xs text-slate-600">{label}</span>
      <span className={`font-mono text-xs ${colorClass}`}>{status || '—'}</span>
    </div>
  );
}

export function StoreDetailDrawer({
  store,
  onClose,
  onEdit,
  onDelete,
  onAddToCompare,
}: StoreDetailDrawerProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [targetWhatsapp, setTargetWhatsapp] = useState('');
  const [includeExtraDetails, setIncludeExtraDetails] = useState(false);

  useEffect(() => {
    if (!store) return;
    setConfirmDelete(false);
  }, [store?.id, store?.numero]);

  if (!store) return null;

  const storeKey = getStoreKey(store);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(storeKey);
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const composedFullAddress = [
    store.endereco?.trim(),
    store.bairro?.trim() &&
    !store.endereco?.toLowerCase().includes(store.bairro.trim().toLowerCase())
      ? store.bairro.trim()
      : '',
    !store.endereco?.toLowerCase().includes(store.cidade.toLowerCase())
      ? `${store.cidade} - ${store.estado}`
      : '',
    store.cep?.trim() ? `CEP ${store.cep.trim()}` : '',
  ]
    .filter(Boolean)
    .join(', ');

  const rawLines: Array<string | null> = [
    `*STZ Engenharia e Manutenção — Dados da Loja*`,
    ``,
    `Número da Loja: ${store.numero} (${store.nome})`,
    `CNPJ: ${store.cnpj}`,
    `Endereço Completo: ${composedFullAddress || `${store.cidade} - ${store.estado}`}`,
    ``,
    `*Dados do Gerente da Loja:*`,
    `Gerente Responsável: ${store.gerenteResponsavel?.trim() || 'Não informado'}`,
    `Tel. Comerciais: ${store.telComerciais?.trim() || 'Não informado'}`,
    store.ramal?.trim() ? `Ramal: ${store.ramal.trim()}` : null,
    store.regionalResponsavel?.trim()
      ? `Regional Responsável: ${store.regionalResponsavel.trim()}`
      : null,
  ];

  const acTotal = getStoreAcTotal(store);

  if (includeExtraDetails) {
    rawLines.push(
      ``,
      `*Operação & Áreas:*`,
      `- Tipo: ${store.tipoLoja}${store.regiao ? ` | Região: ${store.regiao}` : ''}`,
      store.horarioSemana ? `- Horário Semana: ${store.horarioSemana}` : null,
      store.horarioSabado ? `- Sábado: ${store.horarioSabado}` : null,
      store.horarioDomingo ? `- Domingo: ${store.horarioDomingo}` : null,
      `- Área Física Total: ${formatArea(store.areaTotal, true)}`,
      `- Área de Vendas: ${formatArea(store.areaVendas, true)}`,
      `- Área Técnica Útil: ${formatArea(store.areaTecnica, true)}`,
      `- Elevador: ${store.elevador} | Plataforma PNE: ${store.plataformaPne}`,
      acTotal !== null
        ? `- Ar Condicionado (${acTotal} un.): Split ${formatCount(store.acSplit)}, Splitão/Self ${formatCount(store.acSplitaoSelf)}, Fancoil ${formatCount(store.acFancoil)}, VRF ${formatCount(store.acVrf)}`
        : null,
    );
  }

  const formattedMessage = rawLines
    .filter((line): line is string => line !== null)
    .join('\n');

  const cleanDigits = targetWhatsapp.replace(/\D/g, '');
  const waPhone = cleanDigits
    ? cleanDigits.startsWith('55')
      ? cleanDigits
      : `55${cleanDigits}`
    : '';
  const whatsappHref = waPhone
    ? `https://wa.me/${waPhone}?text=${encodeURIComponent(formattedMessage)}`
    : `https://wa.me/?text=${encodeURIComponent(formattedMessage)}`;

  const retaguardaSum =
    (store.copa || 0) +
    (store.salaTi || 0) +
    (store.salaVm || 0) +
    (store.almox || 0) +
    (store.casaMaq || 0) +
    (store.subestacao || 0) +
    (store.deposito || 0) +
    (store.sanitFem || 0) +
    (store.sanitMasc || 0) +
    (store.sanitPne || 0);

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-slate-900/30 backdrop-blur-[1px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-store-title"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl bg-white h-full border-l border-slate-200 flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho da Ficha */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="font-mono font-semibold text-blue-700">
                Unidade {store.numero}
              </span>
              <span aria-hidden="true">·</span>
              <span>{store.tipoLoja}</span>
              <span aria-hidden="true">·</span>
              <span>
                {store.cidade} / {store.estado}
              </span>
              {store.regiao && (
                <>
                  <span aria-hidden="true">·</span>
                  <span>{store.regiao}</span>
                </>
              )}
            </div>
            <h2
              id="drawer-store-title"
              className="mt-1 text-lg font-bold text-slate-900 truncate"
            >
              {store.nome}
            </h2>
            <p className="mt-0.5 font-mono text-xs text-slate-500 tabular-nums">
              CNPJ: {store.cnpj}
            </p>
            <p className="mt-0.5 text-xs text-slate-600 truncate">
              {composedFullAddress || 'Endereço completo não cadastrado'}
            </p>
            {store.gerenteResponsavel && (
              <p className="mt-0.5 text-xs text-slate-600 truncate">
                Gerente: {store.gerenteResponsavel}
                {store.telComerciais ? ` · ${store.telComerciais}` : ''}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar ficha técnica"
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de ações rápidas */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors bg-emerald-700 text-white hover:bg-emerald-800 whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Enviar ao Fornecedor</span>
            </a>
            <button
              type="button"
              onClick={() => onEdit(store)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>
            <button
              type="button"
              onClick={() => onAddToCompare(storeKey)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:border-slate-300 rounded-md transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Comparar</span>
            </button>
          </div>

          {!confirmDelete ? (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Excluir</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-rose-700">Confirmar exclusão?</span>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-700 hover:bg-rose-800 rounded cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Removendo...' : 'Sim, excluir'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="px-2.5 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                Cancelar
              </button>
            </div>
          )}
        </div>

        {/* Conteúdo da Ficha Técnica */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Opções rápidas do redirecionamento WhatsApp */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-md space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="text-xs font-semibold text-slate-800">
                Envio rápido por WhatsApp
              </span>
              <label className="inline-flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeExtraDetails}
                  onChange={(e) => setIncludeExtraDetails(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-700 focus:ring-emerald-600"
                />
                <span>Incluir horários e áreas no envio</span>
              </label>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="tel"
                value={targetWhatsapp}
                onChange={(e) => setTargetWhatsapp(e.target.value)}
                placeholder="WhatsApp do destinatário (opcional, com DDD)"
                aria-label="WhatsApp do destinatário"
                className="flex-1 h-8 px-2.5 text-xs font-mono bg-white border border-slate-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-600"
              />
              <a
                href={whatsappHref}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 h-8 px-3 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded transition-colors whitespace-nowrap"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar via WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Resumo de Áreas Principais */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <p className="text-xs text-slate-500">Área Física</p>
              <p className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                {formatArea(store.areaTotal, true)}
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <p className="text-xs text-slate-500">Área de Vendas</p>
              <p className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                {formatArea(store.areaVendas, true)}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-emerald-700">
                {formatPercent(store.areaVendas, store.areaTotal)} da área física
              </p>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
              <p className="text-xs text-slate-500">Área Técnica</p>
              <p className="mt-1 font-mono text-base font-bold text-slate-900 tabular-nums">
                {formatArea(store.areaTecnica, true)}
              </p>
              <p className="mt-0.5 font-mono text-[11px] text-slate-500">
                {formatPercent(store.areaTecnica || 0, store.areaTotal)} da área física
              </p>
            </div>
          </div>

          {/* Localização & Contatos da Unidade */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Localização, Gerência e Contatos
            </h3>
            <div className="border border-slate-200 rounded-md px-4 py-1">
              <TextRow label="Endereço" value={store.endereco} />
              <TextRow label="Bairro" value={store.bairro} />
              <MetricRow label="CEP" value={store.cep || '—'} />
              <TextRow label="Região" value={store.regiao} />
              <TextRow label="Gerente Responsável" value={store.gerenteResponsavel} />
              <TextRow label="Regional Responsável" value={store.regionalResponsavel} />
              <MetricRow label="Ramal" value={store.ramal || '—'} />
              <MetricRow label="Tel. Comerciais" value={store.telComerciais || '—'} />
            </div>
          </div>

          {/* Horário de Funcionamento */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Horário de Funcionamento
            </h3>
            <div className="border border-slate-200 rounded-md px-4 py-1">
              <MetricRow label="Abre aos Domingos?" value={store.abreDom || '—'} />
              <MetricRow label="Segunda a Sexta" value={store.horarioSemana || '—'} />
              <MetricRow label="Sábado" value={store.horarioSabado || '—'} />
              <MetricRow label="Domingo" value={store.horarioDomingo || '—'} />
            </div>
          </div>

          {/* Retaguarda & Áreas Técnicas */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Retaguarda e Ambientes Técnicos
              </h3>
              <span className="font-mono text-xs text-slate-500 tabular-nums">
                Soma calculada: {formatArea(retaguardaSum, true)}
              </span>
            </div>
            <div className="border border-slate-200 rounded-md px-4 py-1">
              <MetricRow label="Copa" value={formatArea(store.copa, true)} />
              <MetricRow label="Sala TI" value={formatArea(store.salaTi, true)} />
              <MetricRow label="Sala VM" value={formatArea(store.salaVm, true)} />
              <MetricRow label="Almoxarifado" value={formatArea(store.almox, true)} />
              <MetricRow label="Casa de Máquinas" value={formatArea(store.casaMaq, true)} />
              <MetricRow label="Subestação" value={formatArea(store.subestacao, true)} />
              <MetricRow label="Depósito" value={formatArea(store.deposito, true)} />
              <MetricRow
                label="Área Técnica Útil (Registrada)"
                value={formatArea(store.areaTecnica, true)}
                highlight
              />
            </div>
          </div>

          {/* Sanitários Retaguarda Loja de Rua */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Sanitários (Retaguarda Loja de Rua)
            </h3>
            <div className="border border-slate-200 rounded-md px-4 py-1">
              <MetricRow label="Sanitário Feminino" value={formatArea(store.sanitFem, true)} />
              <MetricRow label="Sanitário Masculino" value={formatArea(store.sanitMasc, true)} />
              <MetricRow
                label="Sanitário PNE"
                value={
                  store.sanitPneObs
                    ? `${store.sanitPne !== null ? formatArea(store.sanitPne, true) : ''} (${store.sanitPneObs})`.trim()
                    : formatArea(store.sanitPne, true)
                }
              />
            </div>
          </div>

          {/* Distribuição por Pavimentos e Estacionamento */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Totais por Pavimento e Estacionamento
            </h3>
            <div className="border border-slate-200 rounded-md px-4 py-1">
              <MetricRow label="Área Total Térreo" value={formatArea(store.areaTerreo, true)} />
              <MetricRow label="Área Total Mezanino" value={formatArea(store.areaMezanino, true)} />
              <MetricRow label="Área Total 1º Pavimento" value={formatArea(store.area1Pav, true)} />
              <MetricRow label="Área Total 2º Pavimento" value={formatArea(store.area2Pav, true)} />
              <MetricRow
                label="Área Total Construída"
                value={formatArea(store.areaTotalConstruida, true)}
                highlight
              />
              <MetricRow
                label="Estacionamento"
                value={
                  store.estacionamentoObs
                    ? store.estacionamentoObs
                    : formatArea(store.estacionamento, true)
                }
              />
            </div>
          </div>

          {/* Acesso ao Mezanino */}
          <div>
            <h3 className="text-sm font-semibold text-slate-900 mb-2">
              Acesso ao Mezanino e Mobilidade
            </h3>
            <div className="border border-slate-200 rounded-md px-4 py-1">
              <AccessStatusRow label="Escada Rolante" status={store.escadaRolante} />
              <AccessStatusRow label="Escada" status={store.escada} />
              <AccessStatusRow label="Elevador" status={store.elevador} />
              <AccessStatusRow label="Plataforma PNE" status={store.plataformaPne} />
            </div>
          </div>

          {/* Ar Condicionado — Climatização */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-semibold text-slate-900">
                Climatização (Ar Condicionado)
              </h3>
              <span className="font-mono text-xs font-semibold text-blue-700 tabular-nums">
                Total: {formatCount(acTotal, true)}
              </span>
            </div>
            <div className="border border-slate-200 rounded-md px-4 py-1">
              <MetricRow label="Split" value={formatCount(store.acSplit, true)} />
              <MetricRow label="Splitão / Self" value={formatCount(store.acSplitaoSelf, true)} />
              <MetricRow label="Fancoil" value={formatCount(store.acFancoil, true)} />
              <MetricRow label="VRF" value={formatCount(store.acVrf, true)} />
              <MetricRow
                label="Total de Equipamentos (AC)"
                value={formatCount(acTotal, true)}
                highlight
              />
            </div>
          </div>

          {/* Observações e Registro de Alteração */}
          {(store.observacoes || store.updatedAt) && (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-md space-y-1.5">
              {store.observacoes && (
                <div>
                  <p className="text-xs font-semibold text-slate-700">Observações de Engenharia</p>
                  <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                    {store.observacoes}
                  </p>
                </div>
              )}
              {store.updatedAt && (
                <p className="text-[11px] text-slate-500">
                  Última atualização: {new Date(store.updatedAt).toLocaleString('pt-BR')}
                  {store.updatedBy ? ` · por ${store.updatedBy}` : ''}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
