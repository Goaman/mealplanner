import React from 'react';
import { Plus, X } from 'lucide-react';
import { DailyPlan, MealType, Recipe } from '../types';

interface MealPlannerProps {
  weekPlan: DailyPlan[];
  recipes: Recipe[];
  onUpdateMeal: (date: string, mealType: MealType, recipeId: string | null) => void;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner'];

export function MealPlanner({ weekPlan, recipes, onUpdateMeal }: MealPlannerProps) {
  const [selectedSlot, setSelectedSlot] = React.useState<{date: string, type: MealType} | null>(null);

  const getRecipe = (id?: string) => recipes.find(r => r.id === id);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Weekly Plan</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekPlan.map((day) => (
          <div key={day.date} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-50 p-3 border-b border-blue-100">
              <h3 className="font-semibold text-blue-900 text-center">
                {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
              </h3>
              <p className="text-xs text-blue-600 text-center">
                {new Date(day.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' })}
              </p>
            </div>
            
            <div className="p-2 space-y-2">
              {MEAL_TYPES.map((type) => {
                const meal = day.meals[type];
                const recipe = getRecipe(meal?.recipeId);

                return (
                  <div key={type} className="relative group">
                    <div className="text-xs font-medium text-gray-500 mb-1 capitalize">{type}</div>
                    {recipe ? (
                      <div className="bg-white border border-gray-200 rounded-lg p-2 shadow-sm hover:border-blue-300 transition-colors">
                        <div className="text-sm font-medium text-gray-800 line-clamp-2">{recipe.title}</div>
                        <button 
                          onClick={() => onUpdateMeal(day.date, type, null)}
                          className="absolute top-6 right-1 p-1 bg-white rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:bg-red-50"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedSlot({ date: day.date, type })}
                        className="w-full h-16 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center text-gray-400 hover:border-blue-300 hover:text-blue-500 transition-colors"
                      >
                        <Plus size={20} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {selectedSlot && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl w-full max-w-lg max-h-[80vh] overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold">Select Recipe for {selectedSlot.type}</h3>
              <button onClick={() => setSelectedSlot(null)} className="text-gray-500">✕</button>
            </div>
            <div className="grid gap-2">
              {recipes.map(recipe => (
                <button
                  key={recipe.id}
                  onClick={() => {
                    onUpdateMeal(selectedSlot.date, selectedSlot.type, recipe.id);
                    setSelectedSlot(null);
                  }}
                  className="text-left p-3 hover:bg-blue-50 rounded-lg border border-transparent hover:border-blue-100 transition-all flex items-center gap-3"
                >
                  {recipe.imageUrl && (
                    <img src={recipe.imageUrl} alt="" className="w-10 h-10 rounded object-cover" />
                  )}
                  <span className="font-medium">{recipe.title}</span>
                </button>
              ))}
              {recipes.length === 0 && (
                <p className="text-center text-gray-500 py-4">No recipes available. Add some first!</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}



