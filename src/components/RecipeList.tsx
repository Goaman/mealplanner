import React, { useState } from 'react';
import { Plus, Clock, Users, Trash2, Edit } from 'lucide-react';
import { Recipe } from '../types';

interface RecipeListProps {
  recipes: Recipe[];
  onAddRecipe: (recipe: Omit<Recipe, 'id'>) => void;
  onDeleteRecipe: (id: string) => void;
  onEditRecipe: (recipe: Recipe) => void;
  onNewRecipeClick?: () => void;
}

export function RecipeList({ recipes, onAddRecipe, onDeleteRecipe, onEditRecipe, onNewRecipeClick }: RecipeListProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);

  const handleSave = (recipeData: Omit<Recipe, 'id'>) => {
    if (editingRecipe) {
      onEditRecipe({ ...recipeData, id: editingRecipe.id });
    } else {
      onAddRecipe(recipeData);
    }
    setIsModalOpen(false);
    setEditingRecipe(null);
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-800">My Recipes</h2>
        <button
          onClick={() => {
            if (onNewRecipeClick) {
              onNewRecipeClick();
            } else {
              setEditingRecipe(null);
              setIsModalOpen(true);
            }
          }}
          className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors text-sm"
        >
          <Plus size={16} />
          Add Recipe
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
        {recipes.map((recipe) => (
          <RecipeCard 
            key={recipe.id} 
            recipe={recipe} 
            onDelete={() => onDeleteRecipe(recipe.id)}
            onEdit={() => {
              setEditingRecipe(recipe);
              setIsModalOpen(true);
            }}
          />
        ))}
      </div>

      {isModalOpen && (
        <RecipeModal
          recipe={editingRecipe}
          onClose={() => {
            setIsModalOpen(false);
            setEditingRecipe(null);
          }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}

function RecipeCard({ recipe, onDelete, onEdit }: { recipe: Recipe; onDelete: () => void; onEdit: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {recipe.imageUrl && (
        <img 
          src={recipe.imageUrl} 
          alt={recipe.title} 
          className="w-full h-32 object-cover"
        />
      )}
      <div className="p-2">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-bold text-sm text-gray-800 line-clamp-1">{recipe.title}</h3>
          <div className="flex gap-1">
            <button onClick={onEdit} className="p-0.5 text-gray-400 hover:text-blue-600">
              <Edit size={14} />
            </button>
            <button onClick={onDelete} className="p-0.5 text-gray-400 hover:text-red-600">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
        <p className="text-gray-600 text-xs line-clamp-2 mb-2">{recipe.description}</p>
        
        <div className="flex items-center gap-3 text-xs text-gray-500">
          <div className="flex items-center gap-1">
            <Clock size={12} />
            <span>{recipe.prepTime + recipe.cookTime}m</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={12} />
            <span>{recipe.servings}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface RecipeModalProps {
  recipe: Recipe | null;
  onClose: () => void;
  onSave: (recipe: Omit<Recipe, 'id'>) => void;
}

function RecipeModal({ recipe, onClose, onSave }: RecipeModalProps) {
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    title: recipe?.title || '',
    description: recipe?.description || '',
    ingredients: recipe?.ingredients || [],
    instructions: recipe?.instructions || [],
    imageUrl: recipe?.imageUrl || '',
    prepTime: recipe?.prepTime || 0,
    cookTime: recipe?.cookTime || 0,
    servings: recipe?.servings || 2,
  });

  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });

  const addIngredient = () => {
    if (!newIngredient.name) return;
    setFormData({
      ...formData,
      ingredients: [
        ...formData.ingredients,
        {
          id: crypto.randomUUID(),
          name: newIngredient.name,
          amount: Number(newIngredient.amount) || 0,
          unit: newIngredient.unit,
        }
      ]
    });
    setNewIngredient({ name: '', amount: '', unit: '' });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-2 z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto p-3">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-bold">{recipe ? 'Edit Recipe' : 'New Recipe'}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">✕</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Title</label>
            <input
              type="text"
              required
              className="w-full border rounded p-1.5 text-sm"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Prep (min)</label>
              <input
                type="number"
                className="w-full border rounded p-1.5 text-sm"
                value={formData.prepTime}
                onChange={e => setFormData({ ...formData, prepTime: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Cook (min)</label>
              <input
                type="number"
                className="w-full border rounded p-1.5 text-sm"
                value={formData.cookTime}
                onChange={e => setFormData({ ...formData, cookTime: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Servings</label>
              <input
                type="number"
                className="w-full border rounded p-1.5 text-sm"
                value={formData.servings}
                onChange={e => setFormData({ ...formData, servings: Number(e.target.value) })}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-0.5">Ingredients</label>
            <div className="flex gap-2 mb-1">
              <input
                placeholder="Name"
                className="flex-1 border rounded p-1.5 text-sm"
                value={newIngredient.name}
                onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
              />
              <input
                placeholder="Amt"
                type="number"
                className="w-16 border rounded p-1.5 text-sm"
                value={newIngredient.amount}
                onChange={e => setNewIngredient({ ...newIngredient, amount: e.target.value })}
              />
              <input
                placeholder="Unit"
                className="w-16 border rounded p-1.5 text-sm"
                value={newIngredient.unit}
                onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              />
              <button type="button" onClick={addIngredient} className="bg-blue-600 text-white px-2 rounded">
                <Plus size={16} />
              </button>
            </div>
            <ul className="space-y-1">
              {formData.ingredients.map((ing, idx) => (
                <li key={ing.id} className="flex justify-between text-xs bg-gray-50 p-1 rounded">
                  <span>{ing.amount} {ing.unit} {ing.name}</span>
                  <button
                    type="button"
                    className="text-red-500"
                    onClick={() => setFormData({
                      ...formData,
                      ingredients: formData.ingredients.filter((_, i) => i !== idx)
                    })}
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm">
              Cancel
            </button>
            <button type="submit" className="px-3 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
