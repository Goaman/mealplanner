import { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { RecipeList } from './components/RecipeList';
import { MealPlanner } from './components/MealPlanner';
import { ShoppingList } from './components/ShoppingList';
import { Recipe, DailyPlan, MealType, Ingredient } from './types';
import { supabase } from './lib/supabase';
import { Json } from './types/supabase';

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
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [weekPlan, setWeekPlan] = useState<DailyPlan[]>(generateWeekPlan());
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session as any);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session as any);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;

    const fetchRecipes = async () => {
        const { data, error } = await supabase.from('recipes').select('*');
        if (error) {
            console.error('Error fetching recipes:', error);
        } else if (data) {
            setRecipes(data.map(r => ({
                id: r.id,
                title: r.title,
                description: r.description || '',
                ingredients: (r.ingredients as unknown) as Ingredient[],
                instructions: (r.instructions as unknown) as string[],
                imageUrl: r.image_url || undefined,
                prepTime: r.prep_time,
                cookTime: r.cook_time,
                servings: r.servings
            })));
        }
    };

    const fetchMealPlans = async () => {
        const today = new Date().toISOString().split('T')[0];
        const { data, error } = await supabase.from('meal_plans').select('*').gte('date', today);
        if (error) {
             console.error('Error fetching meal plans:', error);
        } else if (data) {
            if (data.length > 0) {
                 setWeekPlan(currentPlan => {
                     return currentPlan.map(day => {
                         const savedDay = data.find(d => d.date === day.date);
                         if (savedDay) {
                             return {
                                 ...day,
                                 meals: (savedDay.meals as unknown) as DailyPlan['meals']
                             };
                         }
                         return day;
                     });
                 });
            }
        }
    }

    fetchRecipes();
    fetchMealPlans();

  }, [session]);


  const handleAddRecipe = async (newRecipe: Omit<Recipe, 'id'>) => {
      if (!session) return;

      const recipeToSave = {
          title: newRecipe.title,
          description: newRecipe.description,
          ingredients: newRecipe.ingredients as unknown as Json,
          instructions: newRecipe.instructions as unknown as Json,
          image_url: newRecipe.imageUrl || null,
          prep_time: newRecipe.prepTime,
          cook_time: newRecipe.cookTime,
          servings: newRecipe.servings,
      };

      const { data, error } = await supabase.from('recipes').insert([recipeToSave]).select();

      if (error) {
          console.error('Error adding recipe:', error);
          alert('Failed to add recipe');
      } else if (data) {
           const savedRecipe = data[0];
           const formattedRecipe: Recipe = {
               ...newRecipe, 
               id: savedRecipe.id,
           };
           setRecipes([...recipes, formattedRecipe]);
      }
  };

  const handleEditRecipe = async (updatedRecipe: Recipe) => {
      if (!session) return;

      const { error } = await supabase.from('recipes').update({
          title: updatedRecipe.title,
          description: updatedRecipe.description,
          ingredients: updatedRecipe.ingredients as unknown as Json,
          instructions: updatedRecipe.instructions as unknown as Json,
          image_url: updatedRecipe.imageUrl || null,
          prep_time: updatedRecipe.prepTime,
          cook_time: updatedRecipe.cookTime,
          servings: updatedRecipe.servings
      }).eq('id', updatedRecipe.id);

      if (error) {
          console.error('Error updating recipe:', error);
          alert('Failed to update recipe');
      } else {
          setRecipes(recipes.map(r => r.id === updatedRecipe.id ? updatedRecipe : r));
      }
  };

  const handleDeleteRecipe = async (id: string) => {
      if (!session) return;

      const { error } = await supabase.from('recipes').delete().eq('id', id);
      
      if (error) {
          console.error('Error deleting recipe:', error);
           alert('Failed to delete recipe');
      } else {
          setRecipes(recipes.filter(r => r.id !== id));
      }
  };

  const handleUpdateMeal = async (date: string, mealType: MealType, recipeId: string | null) => {
    if (!session) return;
    
    const dayPlan = weekPlan.find(p => p.date === date);
    if (!dayPlan) return;

    const updatedMeals = {
        ...dayPlan.meals,
        [mealType]: { recipeId: recipeId || undefined }
    };

    // Optimistic update
    setWeekPlan(currentPlan => 
      currentPlan.map(day => {
        if (day.date === date) {
          return {
            ...day,
            meals: updatedMeals
          };
        }
        return day;
      })
    );

    // Upsert into Supabase
    const { error } = await supabase.from('meal_plans').upsert([{
        date: date,
        meals: updatedMeals as unknown as Json
    }], { onConflict: 'date,user_id' });

    if (error) {
        console.error('Error updating meal plan:', error);
        // Revert optimistic update if needed (omitted for brevity)
    }
  };
  
  const handleLogout = async () => {
      await supabase.auth.signOut();
      setRecipes([]);
      setWeekPlan(generateWeekPlan());
  };


  if (!session) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
              <div className="text-center">
                  <h1 className="text-4xl font-bold text-blue-600 mb-4">SmartPlanner</h1>
                  <p className="text-gray-600 mb-8">Plan your meals, shop smarter, eat better.</p>
                  <button 
                    onClick={() => supabase.auth.signInAnonymously()}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                      Start Planning (Guest)
                  </button>
                  <div className="mt-4 text-sm text-gray-500">
                    Note: Guest data is saved but clearing browser data may lose it.
                  </div>
              </div>
          </div>
      );
  }

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
        <div className="absolute top-4 right-4">
            <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">
                Sign Out
            </button>
        </div>
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
