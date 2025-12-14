import React, { useState, useEffect } from 'react';
import { AppMode, Recipe } from './types';
import { CrafterView } from './components/CrafterView';
import { AdminView } from './components/AdminView';
import { getRecipes } from './services/storageService';
import { Scroll, Hammer, Shield } from 'lucide-react';

const App: React.FC = () => {
  const [mode, setMode] = useState<AppMode>(AppMode.CRAFTER);
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshRecipes = async () => {
    setLoading(true);
    const data = await getRecipes();
    setRecipes(data);
    setLoading(false);
  };

  useEffect(() => {
    refreshRecipes();
  }, []);

  return (
    <div className="min-h-screen bg-albion-dark text-slate-200 pb-12">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-albion-gold/10 p-2 rounded-lg border border-albion-gold/20">
              <Scroll className="w-8 h-8 text-albion-gold" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Albion <span className="text-albion-gold">Chef</span>
              </h1>
              <p className="text-xs text-slate-400">Crafting Calculator & Database</p>
            </div>
          </div>

          <nav className="flex bg-slate-800 p-1 rounded-lg">
            <button
              onClick={() => setMode(AppMode.CRAFTER)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                mode === AppMode.CRAFTER 
                  ? 'bg-albion-accent text-slate-900 font-bold shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Hammer className="w-4 h-4" /> Crafter
            </button>
            <button
              onClick={() => setMode(AppMode.ADMIN)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                mode === AppMode.ADMIN 
                  ? 'bg-albion-gold text-slate-900 font-bold shadow-lg' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" /> Admin
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-albion-gold"></div>
          </div>
        ) : (
          <>
            {mode === AppMode.CRAFTER && <CrafterView recipes={recipes} />}
            {mode === AppMode.ADMIN && (
              <AdminView 
                onRecipesChanged={refreshRecipes} 
                recipes={recipes} 
              />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default App;