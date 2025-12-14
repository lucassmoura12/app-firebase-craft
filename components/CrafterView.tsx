import React, { useState, useMemo } from 'react';
import { Recipe, CartItem, ShoppingListItem } from '../types';
import { Plus, Trash2, ShoppingCart, Info } from 'lucide-react';

interface CrafterViewProps {
  recipes: Recipe[];
}

export const CrafterView: React.FC<CrafterViewProps> = ({ recipes }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedRecipeId, setSelectedRecipeId] = useState<string>('');
  const [amount, setAmount] = useState<number>(1);

  const handleAddToCart = () => {
    if (!selectedRecipeId || amount <= 0) return;
    
    const recipe = recipes.find(r => r.id === selectedRecipeId);
    if (!recipe) return;

    setCart(prev => {
      const existing = prev.find(item => item.recipe.id === recipe.id);
      if (existing) {
        return prev.map(item => 
          item.recipe.id === recipe.id 
            ? { ...item, count: item.count + amount }
            : item
        );
      }
      return [...prev, { recipe, count: amount }];
    });
    
    // Reset inputs
    setAmount(1);
    setSelectedRecipeId('');
  };

  const removeFromCart = (index: number) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  const shoppingList = useMemo(() => {
    const list: Record<string, number> = {};
    
    cart.forEach(item => {
      item.recipe.ingredients.forEach(ing => {
        const total = ing.quantity * item.count;
        list[ing.name] = (list[ing.name] || 0) + total;
      });
    });

    return Object.entries(list).map(([name, totalQuantity]) => ({
      name,
      totalQuantity
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [cart]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Selection Panel */}
      <div className="bg-albion-panel p-6 rounded-lg border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-albion-gold mb-6 flex items-center gap-2">
          <Info className="w-6 h-6" /> Recipe Selection
        </h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Choose Recipe</label>
            <select 
              value={selectedRecipeId}
              onChange={(e) => setSelectedRecipeId(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-albion-accent focus:outline-none"
            >
              <option value="">-- Select a Recipe --</option>
              {recipes.map(r => (
                <option key={r.id} value={r.id}>
                  [{r.type}] {r.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Quantity to Craft</label>
            <input 
              type="number" 
              min="1"
              value={amount}
              onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full bg-slate-900 border border-slate-700 rounded-md p-3 text-white focus:ring-2 focus:ring-albion-accent focus:outline-none"
            />
          </div>

          <button 
            onClick={handleAddToCart}
            disabled={!selectedRecipeId}
            className="w-full bg-albion-accent text-slate-900 font-bold py-3 px-4 rounded-md hover:bg-sky-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" /> Add to Crafting List
          </button>
        </div>

        {/* Cart Preview */}
        {cart.length > 0 && (
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-slate-300 mb-3">Selected Recipes</h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center bg-slate-800 p-3 rounded border border-slate-700">
                  <div>
                    <span className="text-albion-gold font-bold">{item.count}x</span>
                    <span className="ml-2 text-slate-200">{item.recipe.name}</span>
                  </div>
                  <button onClick={() => removeFromCart(idx)} className="text-slate-500 hover:text-albion-danger">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Panel */}
      <div className="bg-albion-panel p-6 rounded-lg border border-slate-700 shadow-xl">
        <h2 className="text-2xl font-bold text-albion-gold mb-6 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6" /> Material Requirements
        </h2>

        {shoppingList.length === 0 ? (
          <div className="text-center text-slate-500 py-12">
            <p>Select recipes to calculate ingredients.</p>
          </div>
        ) : (
          <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700">
            <table className="w-full text-left">
              <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                <tr>
                  <th className="p-4">Ingredient</th>
                  <th className="p-4 text-right">Total Required</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {shoppingList.map((item) => (
                  <tr key={item.name} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-4 text-slate-200 font-medium">{item.name}</td>
                    <td className="p-4 text-right text-albion-accent font-mono font-bold text-lg">
                      {item.totalQuantity.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};