import React, { useMemo } from 'react';
import { CheckSquare, Square } from 'lucide-react';
import { DailyPlan, Recipe, Ingredient } from '../types';

interface ShoppingListProps {
  weekPlan: DailyPlan[];
  recipes: Recipe[];
}

export function ShoppingList({ weekPlan, recipes }: ShoppingListProps) {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());

  const shoppingList = useMemo(() => {
    const ingredients: Record<string, Ingredient> = {};

    weekPlan.forEach(day => {
      Object.values(day.meals).forEach(meal => {
        if (meal.recipeId) {
          const recipe = recipes.find(r => r.id === meal.recipeId);
          if (recipe) {
            recipe.ingredients.forEach(ing => {
              const key = `${ing.name.toLowerCase()}-${ing.unit.toLowerCase()}`;
              if (ingredients[key]) {
                ingredients[key].amount += ing.amount;
              } else {
                ingredients[key] = { ...ing, id: key };
              }
            });
          }
        }
      });
    });

    return Object.values(ingredients).sort((a, b) => a.name.localeCompare(b.name));
  }, [weekPlan, recipes]);

  const toggleItem = (id: string) => {
    const newChecked = new Set(checkedItems);
    if (newChecked.has(id)) {
      newChecked.delete(id);
    } else {
      newChecked.add(id);
    }
    setCheckedItems(newChecked);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Shopping List</h2>
      
      {shoppingList.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
          <p className="text-gray-500">Your shopping list is empty. Add meals to your plan first!</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
          {shoppingList.map((item) => {
            const isChecked = checkedItems.has(item.id);
            return (
              <div 
                key={item.id}
                className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                  isChecked ? 'bg-gray-50' : ''
                }`}
                onClick={() => toggleItem(item.id)}
              >
                <button className={`mr-4 ${isChecked ? 'text-green-500' : 'text-gray-400'}`}>
                  {isChecked ? <CheckSquare /> : <Square />}
                </button>
                <div className={`flex-1 ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-gray-500 font-medium">
                  {item.amount > 0 && `${item.amount} ${item.unit}`}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

