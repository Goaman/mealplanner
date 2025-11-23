export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: string;
  isChecked?: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  description: string;
  ingredients: Ingredient[];
  instructions: string[];
  imageUrl?: string;
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  servings: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface MealSlot {
  recipeId?: string;
  recipe?: Recipe; // Populated recipe
  customEntry?: string; // For non-recipe meals
}

export interface DailyPlan {
  date: string; // ISO date string YYYY-MM-DD
  meals: Record<MealType, MealSlot>;
}

export interface User {
  uid: string;
  email: string;
  displayName: string;
}



