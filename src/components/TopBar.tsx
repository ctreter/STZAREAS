import { Plus } from 'lucide-react';
import type { ActiveTab } from '../types/store.ts';

interface TopBarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onAddStore: () => void;
}

const NAV_ITEMS: { id: ActiveTab; label: string }[] = [
  { id: 'inicio', label: 'Início' },
  { id: 'base', label: 'Base Consolidada' },
  { id: 'indicadores', label: 'Indicadores' },
  { id: 'comparativo', label: 'Comparativo' },
  { id: 'infraestrutura', label: 'Infraestrutura' },
];

export function TopBar({ activeTab, onTabChange, onAddStore }: TopBarProps) {
  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <button
          type="button"
          onClick={() => onTabChange('inicio')}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded"
        >
          stz - areas consolidadas
        </button>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-6 overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`relative py-5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isActive
                    ? 'text-blue-700'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {item.label}
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-700"
                  />
                )}
              </button>
            );
          })}
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onAddStore}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-700 hover:bg-blue-800 active:bg-blue-900 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Unidade</span>
          </button>
        </div>
      </div>

      {/* Navegação mobile compacta */}
      <nav
        aria-label="Navegação mobile"
        className="flex md:hidden items-center gap-4 px-4 pb-2.5 overflow-x-auto border-t border-slate-100"
      >
        {NAV_ITEMS.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`py-1.5 text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer border-b-2 transition-colors ${
                isActive
                  ? 'text-blue-700 border-blue-700'
                  : 'text-slate-600 border-transparent hover:text-slate-900'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </nav>
    </header>
  );
}
