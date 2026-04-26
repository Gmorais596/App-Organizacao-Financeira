import { Trash2, TrendingUp, TrendingDown, Award, ChevronDown, ChevronUp } from 'lucide-react';
import { useFinanceContext } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

const MONTHLY_DIVISOR = 4.33;

export function History() {
  const { history, deleteHistoryEntry, loading, fetchHistoryDetails } = useFinanceContext();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [detailsMap, setDetailsMap] = useState<Record<string, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<string | null>(null);

  const handleToggleExpand = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }

    setExpandedId(id);
    
    if (!detailsMap[id]) {
      setLoadingDetails(id);
      try {
        const details = await fetchHistoryDetails(id);
        setDetailsMap(prev => ({ ...prev, [id]: details }));
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetails(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const totalSaved = history.reduce((acc, entry) => acc + entry.final_balance, 0);
  const avgSobra = history.length > 0 ? totalSaved / history.length : 0;

  const bestWeek =
    history.length > 0 ? [...history].sort((a, b) => b.final_balance - a.final_balance)[0] : null;

  const worstWeek =
    history.length > 0 ? [...history].sort((a, b) => a.final_balance - b.final_balance)[0] : null;

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
      {/* Stats Header */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Total Acumulado"
          value={totalSaved}
          icon={<TrendingUp className="text-success" size={16} />}
          color={totalSaved >= 0 ? 'text-success' : 'text-danger'}
        />
        <StatCard
          label="Média Semanal"
          value={avgSobra}
          icon={<Award className="text-primary" size={16} />}
          color={avgSobra >= 0 ? 'text-success' : 'text-danger'}
        />
        {bestWeek && (
          <StatCard
            label="Melhor Semana"
            value={bestWeek.final_balance}
            icon={<TrendingUp className="text-success" size={16} />}
            color="text-success"
            small
          />
        )}
        {worstWeek && (
          <StatCard
            label="Pior Semana"
            value={worstWeek.final_balance}
            icon={<TrendingDown className="text-danger" size={16} />}
            color="text-danger"
            small
          />
        )}
      </div>

      {/* History List */}
      <div className="space-y-4">
        <h3 className="text-white font-semibold px-1">Semanas Anteriores</h3>

        {history.length === 0 ? (
          <div className="p-8 glass rounded-3xl text-center text-white/20 italic">
            Nenhuma semana fechada ainda
          </div>
        ) : (
          history.map((entry) => {
            const isExpanded = expandedId === entry.id;
            const details = detailsMap[entry.id];
            const canHaveDetails = entry.total_income > 0 || entry.total_weekly_expenses > 0 || entry.total_monthly_equivalent > 0;

            return (
              <div
                key={entry.id}
                className="glass rounded-3xl overflow-hidden"
              >
                {/* Summary Row - always visible */}
                <div className="p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider">Semana de</p>
                      <p className="text-white font-bold">{entry.week_end}</p>
                    </div>
                    <button
                      onClick={() => setDeleteId(entry.id)}
                      className="p-2 text-white/10 hover:text-danger transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-white/30 text-[10px]">Ganhos</p>
                      <p className="text-success font-semibold text-xs">
                        {formatCurrency(entry.total_income)}
                      </p>
                    </div>
                    <div>
                      <p className="text-white/30 text-[10px]">Gastos Totais</p>
                      <p className="text-danger font-semibold text-xs">
                        {formatCurrency(entry.total_weekly_expenses + entry.total_monthly_equivalent)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-white/40 text-xs">Sobra Real</span>
                    <span
                      className={`font-bold ${entry.final_balance >= 0 ? 'text-success' : 'text-danger'}`}
                    >
                      {formatCurrency(entry.final_balance)}
                    </span>
                  </div>
                </div>

                {/* Expand/Collapse Button */}
                {canHaveDetails && (
                  <button
                    onClick={() => handleToggleExpand(entry.id)}
                    className="w-full flex items-center justify-center gap-2 py-3 border-t border-white/5 text-white/30 hover:text-white/60 transition-colors text-xs"
                    disabled={loadingDetails === entry.id}
                  >
                    {loadingDetails === entry.id ? (
                      <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white/60"></div>
                    ) : isExpanded ? (
                      <>Esconder detalhes <ChevronUp size={14} /></>
                    ) : (
                      <>Ver detalhes <ChevronDown size={14} /></>
                    )}
                  </button>
                )}

                {/* Expanded Details */}
                {isExpanded && details && (
                  <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    {/* Incomes */}
                    {details.incomes && details.incomes.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-success text-[10px] uppercase tracking-wider font-semibold">Ganhos</p>
                        {details.incomes.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center py-1.5">
                            <div>
                              <p className="text-white text-xs">{item.name}</p>
                              {item.category && <span className="text-white/20 text-[10px]">{item.category}</span>}
                            </div>
                            <span className="text-success text-xs font-semibold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Weekly Expenses */}
                    {details.expenses && details.expenses.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-danger text-[10px] uppercase tracking-wider font-semibold">Gastos Semanais</p>
                        {details.expenses.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center py-1.5">
                            <div>
                              <p className="text-white text-xs">{item.name}</p>
                              {item.category && <span className="text-white/20 text-[10px]">{item.category}</span>}
                            </div>
                            <span className="text-danger text-xs font-semibold">{formatCurrency(item.amount)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Monthly Expenses */}
                    {details.monthly_expenses && details.monthly_expenses.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-orange-400 text-[10px] uppercase tracking-wider font-semibold">Gastos Mensais (/ 4.33)</p>
                        {details.monthly_expenses.map((item: any) => (
                          <div key={item.id} className="flex justify-between items-center py-1.5">
                            <div>
                              <p className="text-white text-xs">{item.name}</p>
                              {item.category && <span className="text-white/20 text-[10px]">{item.category}</span>}
                            </div>
                            <div className="text-right">
                              <span className="text-orange-400 text-xs font-semibold">
                                {formatCurrency(item.value / MONTHLY_DIVISOR)}
                              </span>
                              <p className="text-white/20 text-[9px]">({formatCurrency(item.value)}/mês)</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <ConfirmModal
          title="Excluir Semana"
          message="Tem certeza que deseja excluir este registro do histórico?"
          confirmText="Excluir"
          danger
          onConfirm={() => {
            deleteHistoryEntry(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  small?: boolean;
}

function StatCard({ label, value, icon, color, small }: StatCardProps) {
  return (
    <div className={`glass rounded-2xl p-4 flex flex-col justify-between ${small ? 'opacity-80' : ''}`}>
      <div className="flex justify-between items-start mb-2">
        <span className="text-white/40 text-[10px] uppercase tracking-wider">{label}</span>
        {icon}
      </div>
      <p className={`font-bold ${small ? 'text-sm' : 'text-lg'} ${color}`}>
        {formatCurrency(value)}
      </p>
    </div>
  );
}
