export interface Ingredient {
  name: string;
  quantity: number;
}

export interface Recipe {
  id: string;
  name: string;
  type: 'Food' | 'Potion';
  ingredients: Ingredient[];
}

export interface CartItem {
  recipe: Recipe;
  count: number;
}

export interface ShoppingListItem {
  name: string;
  totalQuantity: number;
}

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

export enum AppMode {
  CRAFTER = 'CRAFTER',
  ADMIN = 'ADMIN'
}