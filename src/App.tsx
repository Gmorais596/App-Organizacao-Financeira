import { useState } from 'react';
import { Summary } from './components/Summary';
import { History } from './components/History';
import { Goals } from './components/Goals';
import { BottomNav } from './components/BottomNav';
import { FinanceProvider } from './context/FinanceContext';
import { useAuth } from './context/AuthContext';
import { Auth } from './components/Auth';
import { LogOut } from 'lucide-react';

type Tab = 'summary' | 'history' | 'goals';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('summary');
  const { session, loading, signOut } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return <Auth />;
  }

  return (
    <FinanceProvider>
      <div className="min-h-screen bg-background text-white selection:bg-primary/30">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-md px-6 py-4 border-b border-white/5 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tight">
            Finanças<span className="text-primary">.</span>
          </h1>
          <button 
            onClick={signOut}
            className="text-white/60 hover:text-white transition-colors"
            title="Sair da conta"
          >
            <LogOut size={20} />
          </button>
        </header>

        {/* Main Content */}
        <main className="pb-24">
          {activeTab === 'summary' && <Summary />}
          {activeTab === 'history' && <History />}
          {activeTab === 'goals' && <Goals />}
        </main>

        {/* Navigation */}
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>
    </FinanceProvider>
  );
}

export default App;
