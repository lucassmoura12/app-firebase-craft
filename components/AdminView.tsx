import React, { useState, useEffect } from 'react';
import { Recipe, Ingredient, FirebaseConfig } from '../types';
import { saveRecipe, deleteRecipe, saveRecipesBatch } from '../services/storageService';
import { generateAlbionRecipes } from '../services/geminiService';
import { getFirebaseConfig, saveFirebaseConfig, clearFirebaseConfig, getDb } from '../services/firebaseService';
import { Lock, Plus, Trash2, Wand2, Loader2, Save, Database, Settings, LogOut } from 'lucide-react';

interface AdminViewProps {
  onRecipesChanged: () => void;
  recipes: Recipe[];
}

export const AdminView: React.FC<AdminViewProps> = ({ onRecipesChanged, recipes }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  
  // Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Food' | 'Potion'>('Food');
  const [newIngredients, setNewIngredients] = useState<Ingredient[]>([]);
  const [ingName, setIngName] = useState('');
  const [ingQty, setIngQty] = useState<number>(1);
  
  // Config State
  const [fbConfig, setFbConfig] = useState<FirebaseConfig>({
    apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: ''
  });
  
  // AI State
  const [isGenerating, setIsGenerating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const currentConfig = getFirebaseConfig();
    if (currentConfig) {
      setFbConfig(currentConfig);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'notagg') {
      setIsAuthenticated(true);
    } else {
      alert('Access Denied');
    }
  };

  const addIngredientToForm = () => {
    if (!ingName || ingQty <= 0) return;
    setNewIngredients([...newIngredients, { name: ingName, quantity: ingQty }]);
    setIngName('');
    setIngQty(1);
  };

  const removeIngredientFromForm = (index: number) => {
    setNewIngredients(newIngredients.filter((_, i) => i !== index));
  };

  const handleCreateRecipe = async () => {
    if (!newName || newIngredients.length === 0) {
      alert("Please provide a name and at least one ingredient.");
      return;
    }

    setIsProcessing(true);
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      name: newName,
      type: newType,
      ingredients: newIngredients
    };

    await saveRecipe(recipe);
    await onRecipesChanged();
    
    // Reset Form
    setNewName('');
    setNewIngredients([]);
    setIsProcessing(false);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this recipe?')) {
      setIsProcessing(true);
      await deleteRecipe(id);
      await onRecipesChanged();
      setIsProcessing(false);
    }
  };

  const handleGenerateRecipes = async () => {
    setIsGenerating(true);
    try {
      const generated = await generateAlbionRecipes("High tier Food and Potions");
      if (generated.length > 0) {
        await saveRecipesBatch(generated);
        await onRecipesChanged();
        alert(`Successfully generated ${generated.length} recipes!`);
      }
    } catch (error) {
      alert("Failed to generate recipes. Check console for details.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveFirebaseConfig(fbConfig);
    setShowConfig(false);
    onRecipesChanged(); // Reload recipes from new source
    alert("Configuration saved. Database connection updated.");
  };

  const handleClearConfig = () => {
    if (confirm("Disconnect from Firebase? You will revert to local storage.")) {
      clearFirebaseConfig();
      setFbConfig({ apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' });
      setShowConfig(false);
      onRecipesChanged();
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <div className="bg-albion-panel p-8 rounded-lg shadow-2xl border border-slate-700 w-full max-w-md">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-800 p-4 rounded-full">
              <Lock className="w-8 h-8 text-albion-gold" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-center mb-6 text-white">Restricted Area</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              placeholder="Enter Access Code"
              className="w-full bg-slate-900 border border-slate-700 rounded p-3 text-center text-white focus:border-albion-gold outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button type="submit" className="w-full bg-albion-gold text-slate-900 font-bold py-3 rounded hover:bg-yellow-400 transition-colors">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (showConfig) {
    return (
      <div className="max-w-2xl mx-auto bg-albion-panel p-6 rounded-lg border border-slate-700">
        <h2 className="text-2xl font-bold text-albion-gold mb-6 flex items-center gap-2">
          <Database className="w-6 h-6" /> Firebase Configuration
        </h2>
        <p className="text-sm text-slate-400 mb-4">
          Enter your Firebase project details to enable cloud persistence. 
          Leave empty to use local storage.
        </p>
        <form onSubmit={handleSaveConfig} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase text-slate-500 block mb-1">API Key</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white" 
                value={fbConfig.apiKey} onChange={e => setFbConfig({...fbConfig, apiKey: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500 block mb-1">Auth Domain</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                value={fbConfig.authDomain} onChange={e => setFbConfig({...fbConfig, authDomain: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500 block mb-1">Project ID</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                value={fbConfig.projectId} onChange={e => setFbConfig({...fbConfig, projectId: e.target.value})} required />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500 block mb-1">Storage Bucket</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                value={fbConfig.storageBucket} onChange={e => setFbConfig({...fbConfig, storageBucket: e.target.value})} />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500 block mb-1">Messaging Sender ID</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                value={fbConfig.messagingSenderId} onChange={e => setFbConfig({...fbConfig, messagingSenderId: e.target.value})} />
            </div>
            <div>
              <label className="text-xs uppercase text-slate-500 block mb-1">App ID</label>
              <input type="text" className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white"
                value={fbConfig.appId} onChange={e => setFbConfig({...fbConfig, appId: e.target.value})} />
            </div>
          </div>
          <div className="flex gap-4 pt-4">
             <button type="button" onClick={() => setShowConfig(false)} className="px-4 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white">Cancel</button>
             <button type="button" onClick={handleClearConfig} className="px-4 py-2 rounded bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800">Disconnect</button>
             <button type="submit" className="px-4 py-2 rounded bg-green-600 hover:bg-green-500 text-white font-bold flex-1">Save Configuration</button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <div className="flex justify-between items-center bg-slate-800/50 p-4 rounded-lg border border-slate-700">
         <div className="flex items-center gap-2">
           <div className={`w-3 h-3 rounded-full ${getDb() ? 'bg-green-500' : 'bg-slate-500'}`}></div>
           <span className="text-sm text-slate-300">
             Status: <span className="font-bold">{getDb() ? 'Connected to Firebase' : 'Local Storage'}</span>
           </span>
         </div>
         <button onClick={() => setShowConfig(true)} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-2 rounded text-white transition">
           <Settings className="w-4 h-4" /> Configure Database
         </button>
       </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Panel */}
        <div className="bg-albion-panel p-6 rounded-lg border border-slate-700">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-albion-gold flex items-center gap-2">
              <Plus className="w-6 h-6" /> Create Recipe
            </h2>
            <button 
              onClick={handleGenerateRecipes}
              disabled={isGenerating || isProcessing}
              className="flex items-center gap-2 text-xs bg-slate-800 text-albion-accent px-3 py-1 rounded border border-albion-accent/30 hover:bg-slate-700 transition"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin"/> : <Wand2 className="w-4 h-4" />}
              Auto-Generate
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className="text-xs text-slate-400 uppercase">Recipe Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="e.g. Beef Stew"
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white mt-1"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 uppercase">Type</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white mt-1"
                >
                  <option value="Food">Food</option>
                  <option value="Potion">Potion</option>
                </select>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-4">
              <label className="text-xs text-slate-400 uppercase block mb-2">Ingredients</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Ingredient Name"
                  value={ingName}
                  onChange={e => setIngName(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                />
                <input
                  type="number"
                  placeholder="Qty"
                  value={ingQty}
                  onChange={e => setIngQty(parseInt(e.target.value))}
                  className="w-20 bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm"
                />
                <button 
                  onClick={addIngredientToForm}
                  className="bg-slate-700 hover:bg-slate-600 text-white p-2 rounded"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto">
                {newIngredients.map((ing, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-slate-800 p-2 rounded text-sm">
                    <span>{ing.quantity}x {ing.name}</span>
                    <button onClick={() => removeIngredientFromForm(idx)} className="text-red-400">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleCreateRecipe}
              disabled={isProcessing}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded flex justify-center items-center gap-2 mt-4 disabled:opacity-50"
            >
              {isProcessing ? <Loader2 className="w-5 h-5 animate-spin"/> : <Save className="w-5 h-5" />}
              Save Recipe
            </button>
          </div>
        </div>

        {/* List Panel */}
        <div className="bg-albion-panel p-6 rounded-lg border border-slate-700">
          <h2 className="text-2xl font-bold text-slate-200 mb-6">Database ({recipes.length})</h2>
          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
            {recipes.map(recipe => (
              <div key={recipe.id} className="bg-slate-800 p-4 rounded border-l-4 border-albion-gold relative group">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-white text-lg">{recipe.name}</h3>
                    <span className="text-xs text-albion-accent bg-albion-accent/10 px-2 py-0.5 rounded-full">
                      {recipe.type}
                    </span>
                  </div>
                  <button 
                    onClick={() => handleDelete(recipe.id)}
                    disabled={isProcessing}
                    className="text-slate-600 hover:text-albion-danger opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
                <div className="mt-3 text-sm text-slate-400">
                  <p className="text-xs uppercase mb-1 font-semibold text-slate-500">Requires:</p>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.map((ing, i) => (
                      <span key={i} className="bg-slate-900 px-2 py-1 rounded">
                        {ing.quantity} {ing.name}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};