import { Plus, Target, Trash2, Wallet } from 'lucide-react';
import { useFinanceContext } from '../context/FinanceContext';
import { formatCurrency } from '../utils/format';
import { useState } from 'react';
import { ConfirmModal } from './ConfirmModal';

export function Goals() {
  const { goals, addGoal, updateGoal, depositFromBalance, removeGoal, remaining, loading } = useFinanceContext();
  const [showAdd, setShowAdd] = useState(false);
  const [addAmount, setAddAmount] = useState<{ id: string; name: string; value: string; fromBalance: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newGoal, setNewGoal] = useState({ name: '', target: '', current: '', weekly: '' });

  if (loading) {
    return (
      <div className="flex justify-center py-20 text-primary">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoal.name || !newGoal.target) return;
    addGoal({
      name: newGoal.name,
      target: parseFloat(newGoal.target),
      current: parseFloat(newGoal.current || '0'),
      weekly_contribution: parseFloat(newGoal.weekly || '0'),
    });
    setNewGoal({ name: '', target: '', current: '', weekly: '' });
    setShowAdd(false);
  };

  const handleDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addAmount || !addAmount.value) return;
    const amount = parseFloat(addAmount.value);
    if (addAmount.fromBalance) {
      depositFromBalance(addAmount.id, amount, addAmount.name);
    } else {
      updateGoal(addAmount.id, amount);
    }
    setAddAmount(null);
  };

  return (
    <div className="pb-24 px-4 pt-6 max-w-lg mx-auto space-y-6">
      <div className="flex justify-between items-center px-1">
        <h2 className="text-xl font-bold text-white">Minhas Metas</h2>
        <button
          onClick={() => setShowAdd(true)}
          className="p-2 bg-primary rounded-full text-white shadow-lg shadow-primary/20"
        >
          <Plus size={20} />
        </button>
      </div>

      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="p-12 glass rounded-3xl text-center">
            <div className="bg-primary/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="text-primary" size={32} />
            </div>
            <p className="text-white font-medium mb-2">Nenhuma meta criada</p>
            <p className="text-white/30 text-xs px-8">
              Comece a planejar seus sonhos financeiros agora mesmo.
            </p>
          </div>
        ) : (
          goals.map((goal) => {
            const progress = Math.min((goal.current / goal.target) * 100, 100);
            const left = Math.max(goal.target - goal.current, 0);

            return (
              <div
                key={goal.id}
                className="glass rounded-3xl p-6 space-y-5 relative overflow-hidden group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/20 p-2.5 rounded-2xl">
                      <Target className="text-primary" size={20} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold">{goal.name}</h3>
                      <p className="text-white/30 text-[10px]">Faltam {formatCurrency(left)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setDeleteId(goal.id)}
                    className="text-white/10 hover:text-danger p-2 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium">
                    <span className="text-white/60">{formatCurrency(goal.current)}</span>
                    <span className="text-white/40">de {formatCurrency(goal.target)}</span>
                  </div>
                  <div className="h-2.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <p className="text-right text-[10px] text-primary font-bold">
                    {progress.toFixed(1)}%
                  </p>
                </div>

                <div className="pt-4 border-t border-white/5 flex justify-between items-center">
                  <div>
                    <p className="text-white/30 text-[10px]">Aporte Semanal</p>
                    <p className="text-white text-xs font-semibold">
                      {formatCurrency(goal.weekly_contribution)}
                    </p>
                  </div>
                  <button
                    onClick={() => setAddAmount({ id: goal.id, name: goal.name, value: '', fromBalance: false })}
                    className="flex items-center gap-1.5 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-primary text-xs font-bold transition-colors"
                  >
                    <Plus size={14} />
                    Adicionar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirm Modal */}
      {deleteId && (
        <ConfirmModal
          title="Excluir Meta"
          message="Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita."
          confirmText="Excluir"
          danger
          onConfirm={() => {
            removeGoal(deleteId);
            setDeleteId(null);
          }}
          onCancel={() => setDeleteId(null)}
        />
      )}

      {/* Add Amount Modal */}
      {addAmount && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setAddAmount(null)}
          />
          <div className="glass w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10">
            <h3 className="text-xl font-bold text-white mb-2">Adicionar à Meta</h3>
            <p className="text-white/40 text-xs mb-6">{addAmount.name}</p>

            <form onSubmit={handleDeposit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">Valor</label>
                <input
                  autoFocus
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary"
                  value={addAmount.value}
                  onChange={(e) => setAddAmount({ ...addAmount, value: e.target.value })}
                  required
                />
              </div>

              {/* Toggle: Deduct from weekly balance */}
              <button
                type="button"
                onClick={() => setAddAmount({ ...addAmount, fromBalance: !addAmount.fromBalance })}
                className={`w-full flex items-center gap-3 p-4 rounded-2xl border transition-all ${
                  addAmount.fromBalance
                    ? 'border-primary bg-primary/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className={`p-2 rounded-xl ${addAmount.fromBalance ? 'bg-primary/20' : 'bg-white/5'}`}>
                  <Wallet size={18} className={addAmount.fromBalance ? 'text-primary' : 'text-white/30'} />
                </div>
                <div className="text-left flex-1">
                  <p className={`text-sm font-semibold ${addAmount.fromBalance ? 'text-white' : 'text-white/60'}`}>
                    Tirar do saldo semanal
                  </p>
                  <p className="text-[10px] text-white/30">
                    Saldo atual: <span className={remaining >= 0 ? 'text-success' : 'text-danger'}>{formatCurrency(remaining)}</span>
                  </p>
                </div>
                <div className={`w-10 h-6 rounded-full p-0.5 transition-colors ${addAmount.fromBalance ? 'bg-primary' : 'bg-white/10'}`}>
                  <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${addAmount.fromBalance ? 'translate-x-4' : 'translate-x-0'}`} />
                </div>
              </button>

              {addAmount.fromBalance && (
                <p className="text-orange-400 text-[11px] px-1">
                  ⚠️ O valor será adicionado como gasto semanal no Resumo
                </p>
              )}

              <button className="w-full py-4 bg-primary rounded-2xl font-bold text-white active:scale-95 transition-transform shadow-lg shadow-primary/20">
                Confirmar Depósito
              </button>
            </form>
          </div>
        </div>
      )}

      {/* New Goal Modal */}
      {showAdd && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowAdd(false)}
          />
          <div className="glass w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10">
            <h3 className="text-xl font-bold text-white mb-6">Nova Meta</h3>
            <form onSubmit={handleAdd} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">Nome da Meta</label>
                <input
                  autoFocus
                  placeholder="Ex: Viagem para o Brasil"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary"
                  value={newGoal.name}
                  onChange={(e) => setNewGoal({ ...newGoal, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">Valor Objetivo</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="2500.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary"
                  value={newGoal.target}
                  onChange={(e) => setNewGoal({ ...newGoal, target: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">Valor já guardado (Opcional)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="500.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary"
                  value={newGoal.current}
                  onChange={(e) => setNewGoal({ ...newGoal, current: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-white/40 ml-1">Aporte por semana (Opcional)</label>
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.01"
                  placeholder="100.00"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary"
                  value={newGoal.weekly}
                  onChange={(e) => setNewGoal({ ...newGoal, weekly: e.target.value })}
                />
              </div>
              <button className="w-full py-4 bg-primary rounded-2xl font-bold text-white mt-4 active:scale-95 transition-transform shadow-lg shadow-primary/20">
                Criar Meta
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
