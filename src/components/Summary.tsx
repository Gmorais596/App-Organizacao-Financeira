import { Plus, Trash2, ChevronRight } from 'lucide-react';
import { useFinanceContext } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { useState } from 'react';
import { AddItemModal } from './AddItemModal';
import { ConfirmModal } from './ConfirmModal';

export function Summary() {
  const { weeklyData, totals, remaining, removeItem, closeWeek, loading } = useFinanceContext();
  const [modalType, setModalType] = useState<'income' | 'expense' | 'monthly' | null>(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
      {/* Main Balance Card */}
      <div className="glass rounded-3xl p-6 shadow-2xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 blur-3xl -mr-16 -mt-16 rounded-full group-hover:bg-primary/30 transition-all duration-500" />
        <h2 className="text-white/60 text-sm font-medium mb-1">Saldo da Semana</h2>
        <div className={`text-4xl font-bold mb-6 ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
          {formatCurrency(remaining)}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Ganhos</span>
            <p className="text-success font-semibold text-sm">{formatCurrency(totals.gains)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Gastos Semanais</span>
            <p className="text-danger font-semibold text-sm">{formatCurrency(totals.weeklyExpenses)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Mensal (Equiv.)</span>
            <p className="text-orange-400 font-semibold text-sm">{formatCurrency(totals.monthlyEquiv)}</p>
          </div>
          <div className="space-y-1">
            <span className="text-white/40 text-[10px] uppercase tracking-wider">Sobra Final</span>
            <p className={`font-semibold text-sm ${remaining >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(remaining)}
            </p>
          </div>
        </div>
      </div>


      {/* Sections */}
      <Section
        title="Ganhos Semanais"
        items={weeklyData.incomes}
        onAdd={() => setModalType('income')}
        onRemove={(id: string) => removeItem('income', id)}
        color="text-success"
      />

      <Section
        title="Gastos Semanais"
        items={weeklyData.expenses}
        onAdd={() => setModalType('expense')}
        onRemove={(id: string) => removeItem('expense', id)}
        color="text-danger"
      />

      <Section
        title="Gastos Mensais"
        items={weeklyData.monthlyExpenses}
        onAdd={() => setModalType('monthly')}
        onRemove={(id: string) => removeItem('monthly', id)}
        color="text-orange-400"
        subtitle="(Rateado / 4.33)"
        isMonthly
      />

      {/* Close Week Button */}
      <button
        onClick={() => setShowCloseConfirm(true)}
        className="w-full py-4 bg-primary rounded-2xl font-bold text-white shadow-lg shadow-primary/20 active:scale-95 transition-all flex items-center justify-center gap-2"
      >
        Fechar Semana
        <ChevronRight size={20} />
      </button>


      {modalType && (
        <AddItemModal
          type={modalType}
          onClose={() => setModalType(null)}
        />
      )}

      {showCloseConfirm && (
        <ConfirmModal
          title="Fechar Semana"
          message="Deseja fechar a semana atual e salvar no histórico? Os campos serão limpos para uma nova semana."
          confirmText="Fechar Semana"
          onConfirm={() => {
            closeWeek();
            setShowCloseConfirm(false);
          }}
          onCancel={() => setShowCloseConfirm(false)}
        />
      )}
    </div>
  );
}

interface SectionProps {
  title: string;
  items: any[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  color: string;
  subtitle?: string;
  isMonthly?: boolean;
}

function Section({ title, items, onAdd, onRemove, color, subtitle, isMonthly }: SectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-end px-1">
        <div>
          <h3 className="text-white font-semibold">{title}</h3>
          {subtitle && <span className="text-white/30 text-[10px]">{subtitle}</span>}
        </div>
        <button
          onClick={onAdd}
          className="p-1.5 glass rounded-full text-primary active:scale-90 transition-all"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="space-y-2">
        {items.length === 0 ? (
          <div className="p-4 glass rounded-2xl text-center text-white/20 text-xs italic">
            Nenhum item adicionado
          </div>
        ) : (
          items.map((item) => (
            <div key={item.id} className="glass rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="text-white text-sm font-medium">{item.name}</p>
                {item.category && <span className="text-white/30 text-[10px]">{item.category}</span>}
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-sm font-bold ${color}`}>
                  {formatCurrency(isMonthly ? item.value : item.amount)}
                </span>
                <button
                  onClick={() => onRemove(item.id)}
                  className="text-white/20 hover:text-danger transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
