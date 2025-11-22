import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RecipeList } from './components/RecipeList';
import { MealPlanner } from './components/MealPlanner';
import { ShoppingList } from './components/ShoppingList';
import { Recipe, DailyPlan, MealType } from './types';

// Mock Data
const INITIAL_RECIPES: Recipe[] = [
  {
    id: '1',
    title: 'Spaghetti Carbonara',
    description: 'Classic Italian pasta dish with eggs, cheese, pancetta, and black pepper.',
    ingredients: [
      { id: '1', name: 'Spaghetti', amount: 400, unit: 'g' },
      { id: '2', name: 'Pancetta', amount: 150, unit: 'g' },
      { id: '3', name: 'Eggs', amount: 4, unit: 'large' },
      { id: '4', name: 'Pecorino Cheese', amount: 100, unit: 'g' }
    ],
    instructions: ['Boil pasta', 'Fry pancetta', 'Mix eggs and cheese', 'Combine all'],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    imageUrl: 'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '2',
    title: 'Chicken Stir Fry',
    description: 'Quick and healthy vegetable and chicken stir fry.',
    ingredients: [
      { id: '1', name: 'Chicken Breast', amount: 500, unit: 'g' },
      { id: '2', name: 'Bell Peppers', amount: 2, unit: 'whole' },
      { id: '3', name: 'Soy Sauce', amount: 3, unit: 'tbsp' },
      { id: '4', name: 'Rice', amount: 200, unit: 'g' }
    ],
    instructions: ['Cook rice', 'Fry chicken', 'Add veggies', 'Add sauce'],
    prepTime: 15,
    cookTime: 10,
    servings: 2,
    imageUrl: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=80'
  }
];

const generateWeekPlan = (): DailyPlan[] => {
  const today = new Date();
  const plan: DailyPlan[] = [];
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    plan.push({
      date: date.toISOString().split('T')[0],
      meals: {
        breakfast: {},
        lunch: {},
        dinner: {},
        snack: {}
      }
    });
  }
  return plan;
};

function App() {
  const [activeTab, setActiveTab] = useState<'planner' | 'recipes' | 'shopping'>('planner');
  const [recipes, setRecipes] = useState<Recipe[]>(() => {
    const saved = localStorage.getItem('recipes');
    return saved ? JSON.parse(saved) : INITIAL_RECIPES;
  });
  
  const [weekPlan, setWeekPlan] = useState<DailyPlan[]>(() => {
    const saved = localStorage.getItem('weekPlan');
    return saved ? JSON.parse(saved) : generateWeekPlan();
  });

  useEffect(() => {
    localStorage.setItem('recipes', JSON.stringify(recipes));
  }, [recipes]);

  useEffect(() => {
    localStorage.setItem('weekPlan', JSON.stringify(weekPlan));
  }, [weekPlan]);

  const handleAddRecipe = (newRecipe: Omit<Recipe, 'id'>) => {
    const recipe = { ...newRecipe, id: crypto.randomUUID() };
    setRecipes([...recipes, recipe]);
  };

  const handleEditRecipe = (updatedRecipe: Recipe) => {
    setRecipes(recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
  };

  const handleDeleteRecipe = (id: string) => {
    setRecipes(recipes.filter(r => r.id !== id));
  };

  const handleUpdateMeal = (date: string, mealType: MealType, recipeId: string | null) => {
    setWeekPlan(currentPlan => 
      currentPlan.map(day => {
        if (day.date === date) {
          return {
            ...day,
            meals: {
              ...day.meals,
              [mealType]: { recipeId: recipeId || undefined }
            }
          };
        }
        return day;
      })
    );
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'planner' && (
        <MealPlanner 
          weekPlan={weekPlan} 
          recipes={recipes} 
          onUpdateMeal={handleUpdateMeal} 
        />
      )}
      {activeTab === 'recipes' && (
        <RecipeList 
          recipes={recipes} 
          onAddRecipe={handleAddRecipe}
          onEditRecipe={handleEditRecipe}
          onDeleteRecipe={handleDeleteRecipe}
        />
      )}
      {activeTab === 'shopping' && (
        <ShoppingList 
          weekPlan={weekPlan} 
          recipes={recipes} 
        />
      )}
    </Layout>
  );
}

export default App;
