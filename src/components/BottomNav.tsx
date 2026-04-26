import { LayoutDashboard, History, Target } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface BottomNavProps {
  activeTab: 'summary' | 'history' | 'goals';
  setActiveTab: (tab: 'summary' | 'history' | 'goals') => void;
}

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const tabs = [
    { id: 'summary', label: 'Resumo', icon: LayoutDashboard },
    { id: 'history', label: 'Histórico', icon: History },
    { id: 'goals', label: 'Metas', icon: Target },
  ] as const;

  return (
    <nav className="fixed bottom-0 left-0 right-0 glass border-t border-white/10 safe-bottom z-50">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full transition-all duration-300",
              activeTab === id ? "text-primary scale-110" : "text-white/40"
            )}
          >
            <Icon size={24} />
            <span className="text-[10px] mt-1 font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
