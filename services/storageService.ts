import { Recipe } from '../types';
import { getDb } from './firebaseService';
import { collection, getDocs, setDoc, doc, deleteDoc, writeBatch } from 'firebase/firestore';

const STORAGE_KEY = 'albion_recipes_v1';
const COLLECTION_NAME = 'recipes';

// Initial seed data
const DEFAULT_RECIPES: Recipe[] = [
  {
    id: '1',
    name: 'Beef Stew',
    type: 'Food',
    ingredients: [
      { name: 'Raw Beef', quantity: 12 },
      { name: 'Potato', quantity: 12 },
      { name: 'Carrot', quantity: 12 }
    ]
  },
  {
    id: '2',
    name: 'Minor Healing Potion',
    type: 'Potion',
    ingredients: [
      { name: 'Arcane Agaric', quantity: 8 },
      { name: 'Brightleaf Comfrey', quantity: 8 }
    ]
  }
];

// Helper to get from LS
const getLocalRecipes = (): Recipe[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_RECIPES));
    return DEFAULT_RECIPES;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return [];
  }
};

export const getRecipes = async (): Promise<Recipe[]> => {
  const db = getDb();
  if (db) {
    try {
      const querySnapshot = await getDocs(collection(db, COLLECTION_NAME));
      const recipes: Recipe[] = [];
      querySnapshot.forEach((doc) => {
        recipes.push(doc.data() as Recipe);
      });
      return recipes;
    } catch (error) {
      console.error("Error fetching from Firebase:", error);
      return []; // Return empty on error or handle gracefully
    }
  } else {
    // Fallback to LocalStorage
    return new Promise((resolve) => {
        resolve(getLocalRecipes());
    });
  }
};

export const saveRecipe = async (recipe: Recipe): Promise<void> => {
  const db = getDb();
  if (db) {
    await setDoc(doc(db, COLLECTION_NAME, recipe.id), recipe);
  } else {
    const recipes = getLocalRecipes();
    const updatedRecipes = [...recipes, recipe];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecipes));
  }
};

export const deleteRecipe = async (id: string): Promise<void> => {
  const db = getDb();
  if (db) {
    await deleteDoc(doc(db, COLLECTION_NAME, id));
  } else {
    const recipes = getLocalRecipes();
    const updatedRecipes = recipes.filter(r => r.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecipes));
  }
};

export const saveRecipesBatch = async (newRecipes: Recipe[]): Promise<void> => {
  const db = getDb();
  if (db) {
    const batch = writeBatch(db);
    newRecipes.forEach(recipe => {
      const ref = doc(db, COLLECTION_NAME, recipe.id);
      batch.set(ref, recipe);
    });
    await batch.commit();
  } else {
    const current = getLocalRecipes();
    const combined = [...current, ...newRecipes];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(combined));
  }
};