import {
  ArrowLeftRight,
  ArrowRight,
  BarChart3,
  Plus,
  Table2,
  Wrench,
} from 'lucide-react';
import type { ActiveTab, StoreAreaRecord } from '../types/store.ts';

interface HomeLauncherViewProps {
  stores: StoreAreaRecord[];
  statesCount: number;
  onNavigate: (tab: ActiveTab) => void;
  onAddStore: () => void;
}

export function HomeLauncherView({
  stores,
  statesCount,
  onNavigate,
  onAddStore,
}: HomeLauncherViewProps) {
  const quickButtons: {
    id: string;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    onClick: () => void;
    primary?: boolean;
  }[] = [
    {
      id: 'base',
      label: 'Base Consolidada',
      sublabel: `${stores.length} unidades · pesquisa rápida`,
      icon: <Table2 className="w-4 h-4 text-orange-500" />,
      onClick: () => onNavigate('base'),
      primary: true,
    },
    {
      id: 'indicadores',
      label: 'Indicadores',
      sublabel: `${statesCount} UFs · áreas e climatização`,
      icon: <BarChart3 className="w-4 h-4 text-orange-500" />,
      onClick: () => onNavigate('indicadores'),
    },
    {
      id: 'comparativo',
      label: 'Comparativo',
      sublabel: 'Comparar até 4 lojas',
      icon: <ArrowLeftRight className="w-4 h-4 text-orange-500" />,
      onClick: () => onNavigate('comparativo'),
    },
    {
      id: 'infraestrutura',
      label: 'Infraestrutura',
      sublabel: 'Ar condicionado, subestações e elevadores',
      icon: <Wrench className="w-4 h-4 text-orange-500" />,
      onClick: () => onNavigate('infraestrutura'),
    },
    {
      id: 'nova',
      label: 'Nova Unidade',
      sublabel: 'Cadastrar nova loja',
      icon: <Plus className="w-4 h-4 text-orange-500" />,
      onClick: onAddStore,
    },
  ];

  return (
    <main className="min-h-screen w-full bg-[#151515] text-white flex flex-col items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl flex flex-col items-center gap-10">
        {/* Logo oficial STZ Engenharia e Manutenção integrada perfeitamente ao fundo preto */}
        <div className="flex items-center justify-center">
          <img
            src="/assets/aistudio/stz6_bc926938.png"
            alt="STZ Engenharia e Manutenção"
            className="w-64 sm:w-80 h-auto object-contain select-none [clip-path:inset(4px)]"
          />
        </div>

        {/* Botões de acesso rápido ao menu do aplicativo */}
        <nav
          aria-label="Acesso rápido ao menu"
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
        >
          {quickButtons.map((btn) => (
            <button
              key={btn.id}
              type="button"
              onClick={btn.onClick}
              className={`group text-left px-4 py-3.5 rounded-lg border transition-all flex items-center justify-between gap-3 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                btn.primary
                  ? 'sm:col-span-2 lg:col-span-2 bg-[#1f1f1f] border-orange-500/60 hover:bg-[#272727] hover:border-orange-500'
                  : 'bg-[#1b1b1b] border-white/10 hover:bg-[#242424] hover:border-orange-500/60'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="p-2 rounded-md bg-white/5 group-hover:bg-orange-500/10 transition-colors shrink-0">
                  {btn.icon}
                </span>
                <div className="min-w-0">
                  <span className="block text-sm font-semibold text-white truncate whitespace-nowrap">
                    {btn.label}
                  </span>
                  <span className="block text-xs text-neutral-400 truncate font-mono tabular-nums">
                    {btn.sublabel}
                  </span>
                </div>
              </div>
              <ArrowRight
                className="w-4 h-4 text-neutral-500 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all shrink-0"
                aria-hidden="true"
              />
            </button>
          ))}
        </nav>
      </div>
    </main>
  );
}
