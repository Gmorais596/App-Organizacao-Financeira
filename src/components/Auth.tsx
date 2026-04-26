import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Wallet } from 'lucide-react';

export function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro durante a autenticação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-white">
      <div className="w-full max-w-md glass p-8 rounded-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-4 border border-primary/30">
            <Wallet size={32} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            Finanças<span className="text-primary">.</span>
          </h1>
          <p className="text-white/60 text-sm mt-2">
            {isLogin ? 'Entre na sua conta para continuar' : 'Crie sua conta para começar'}
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-danger/20 border border-danger/30 rounded-xl text-danger text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-white/70 mb-1">
              Senha
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-3 rounded-xl transition-colors disabled:opacity-50 mt-6"
          >
            {loading ? 'Aguarde...' : isLogin ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="text-white/60 hover:text-white text-sm transition-colors"
          >
            {isLogin
              ? 'Não tem uma conta? Cadastre-se'
              : 'Já tem uma conta? Entre aqui'}
          </button>
        </div>
      </div>
    </div>
  );
}
