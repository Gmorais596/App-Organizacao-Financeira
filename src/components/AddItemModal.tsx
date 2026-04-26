import { X } from 'lucide-react';
import { useState } from 'react';
import { useFinanceContext } from '../context/FinanceContext';

interface AddItemModalProps {
  type: 'income' | 'expense' | 'monthly';
  onClose: () => void;
}

export function AddItemModal({ type, onClose }: AddItemModalProps) {
  const { addItem } = useFinanceContext();
  const [name, setName] = useState('');
  const [value, setValue] = useState('');
  const [category, setCategory] = useState('');

  const titles = {
    income: 'Adicionar Ganho',
    expense: 'Adicionar Gasto Semanal',
    monthly: 'Adicionar Gasto Mensal',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !value) return;

    const parsedValue = parseFloat(value);
    const itemData = type === 'monthly' 
      ? { name, value: parsedValue, category: category || undefined }
      : { name, amount: parsedValue, category: category || undefined, week_status: 'current' };

    await addItem(type, itemData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      <div className="glass w-full max-w-sm rounded-t-3xl sm:rounded-3xl p-6 relative z-10">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white"
        >
          <X size={20} />
        </button>

        <h3 className="text-xl font-bold text-white mb-6">{titles[type]}</h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-white/40 ml-1">Nome</label>
            <input
              autoFocus
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Uber, Aluguel, Supermercado"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 ml-1">
              Valor {type === 'monthly' ? '(Mensal total — será dividido por 4.33)' : ''}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0.00"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-white/40 ml-1">Categoria (Opcional)</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Ex: Trabalho, Casa, Lazer"
              className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white placeholder:text-white/20 focus:outline-none focus:border-primary transition-colors"
            />
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-primary rounded-2xl font-bold text-white mt-4 active:scale-95 transition-transform shadow-lg shadow-primary/20"
          >
            Adicionar
          </button>
        </form>
      </div>
    </div>
  );
}
