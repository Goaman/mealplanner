import React, { useState } from 'react';
import { Plus, ArrowLeft, Wand2, Image as ImageIcon, Loader2, Search } from 'lucide-react';
import { Recipe } from '../types';
import { generateRecipeAI } from '../lib/ai';

interface NewRecipePageProps {
  onSave: (recipe: Omit<Recipe, 'id'>) => void;
  onCancel: () => void;
}

export function NewRecipePage({ onSave, onCancel }: NewRecipePageProps) {
  const [formData, setFormData] = useState<Omit<Recipe, 'id'>>({
    title: '',
    description: '',
    ingredients: [],
    instructions: [],
    imageUrl: '',
    prepTime: 0,
    cookTime: 0,
    servings: 2,
  });

  const [newIngredient, setNewIngredient] = useState({ name: '', amount: '', unit: '' });
  const [newInstruction, setNewInstruction] = useState('');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const addInstruction = () => {
    if (!newInstruction) return;
    setFormData({
      ...formData,
      instructions: [...formData.instructions, newInstruction]
    });
    setNewInstruction('');
  };

  const removeInstruction = (index: number) => {
    setFormData({
      ...formData,
      instructions: formData.instructions.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt) return;
    
    setIsGenerating(true);
    setError(null);
    try {
      const recipe = await generateRecipeAI(aiPrompt);
      setFormData(prev => ({
        ...prev,
        title: recipe.title || prev.title,
        description: recipe.description || prev.description,
        ingredients: recipe.ingredients?.map((ing: any) => ({
          id: crypto.randomUUID(),
          name: ing.name,
          amount: ing.amount || 0,
          unit: ing.unit || ''
        })) || prev.ingredients,
        instructions: recipe.instructions || prev.instructions,
        prepTime: recipe.prepTime || prev.prepTime,
        cookTime: recipe.cookTime || prev.cookTime,
        servings: recipe.servings || prev.servings,
      }));
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate recipe');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageSearch = () => {
    const query = encodeURIComponent(formData.title || aiPrompt);
    if (!query) return;
    window.open(`https://www.google.com/search?tbm=isch&q=${query}`, '_blank');
  };

  return (
    <div className="max-w-4xl mx-auto p-2">
      <button 
        onClick={onCancel}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-2 text-sm"
      >
        <ArrowLeft size={16} />
        Back
      </button>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Create New Recipe</h1>

        {/* AI Generation Section */}
        <div className="bg-blue-50 border border-blue-100 rounded-lg p-2 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Wand2 className="text-blue-600" size={16} />
            <h2 className="text-sm font-semibold text-blue-900">AI Generator</h2>
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Dish description (e.g., 'Spicy Thai curry')"
              className="flex-1 border-blue-200 rounded p-1.5 text-sm focus:ring-1 focus:ring-blue-500 outline-none"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate()}
            />
            <button
              onClick={handleAiGenerate}
              disabled={isGenerating || !aiPrompt}
              className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm font-medium whitespace-nowrap"
            >
              {isGenerating ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              Generate
            </button>
          </div>
          {error && (
            <div className="mt-1 text-red-600 text-xs">
              Error: {error}
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Basic Info */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Basic Information</h3>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Recipe Title</label>
              <input
                type="text"
                required
                className="w-full border rounded p-1.5 text-sm"
                value={formData.title}
                onChange={e => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Homemade Lasagna"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-0.5">Description</label>
              <textarea
                className="w-full border rounded p-1.5 text-sm h-16"
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
          </div>

          {/* Image Section */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Recipe Image</h3>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Image URL"
                className="flex-1 border rounded p-1.5 text-sm"
                value={formData.imageUrl || ''}
                onChange={e => setFormData({ ...formData, imageUrl: e.target.value })}
              />
              <button
                type="button"
                onClick={handleImageSearch}
                className="bg-gray-100 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm whitespace-nowrap"
              >
                <Search size={16} />
                Search
              </button>
            </div>
            {formData.imageUrl && (
              <img 
                src={formData.imageUrl} 
                alt="Preview" 
                className="w-full h-32 object-cover rounded bg-gray-100"
                onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/800x400?text=Invalid+Image+URL')}
              />
            )}
          </div>

          {/* Ingredients */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Ingredients</h3>
            
            <div className="flex flex-wrap gap-2">
              <input
                placeholder="Ingredient"
                className="flex-[2] border rounded p-1.5 text-sm min-w-[150px]"
                value={newIngredient.name}
                onChange={e => setNewIngredient({ ...newIngredient, name: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <input
                placeholder="Amt"
                type="number"
                className="flex-1 border rounded p-1.5 text-sm min-w-[60px]"
                value={newIngredient.amount}
                onChange={e => setNewIngredient({ ...newIngredient, amount: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <input
                placeholder="Unit"
                className="flex-1 border rounded p-1.5 text-sm min-w-[60px]"
                value={newIngredient.unit}
                onChange={e => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <button 
                type="button" 
                onClick={addIngredient}
                className="bg-green-600 text-white px-3 rounded hover:bg-green-700 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            <ul className="space-y-1">
              {formData.ingredients.map((ing, idx) => (
                <li key={ing.id} className="flex items-center justify-between bg-gray-50 p-1.5 rounded border border-gray-100 text-sm">
                  <span className="font-medium">
                    {ing.amount > 0 && ing.amount} {ing.unit} {ing.name}
                  </span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500 p-0.5"
                    onClick={() => setFormData({
                      ...formData,
                      ingredients: formData.ingredients.filter((_, i) => i !== idx)
                    })}
                  >
                    <Loader2 className="rotate-45" size={14} />
                    <span className="sr-only">Remove</span>
                    <span aria-hidden="true">✕</span>
                  </button>
                </li>
              ))}
              {formData.ingredients.length === 0 && (
                <li className="text-gray-500 italic text-center py-2 bg-gray-50 rounded border border-dashed border-gray-200 text-xs">
                  No ingredients yet
                </li>
              )}
            </ul>
          </div>

          {/* Instructions */}
          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-gray-900 border-b pb-1">Instructions</h3>
            
            <div className="flex gap-2">
              <textarea
                placeholder="Add a step..."
                className="flex-1 border rounded p-1.5 text-sm h-10"
                value={newInstruction}
                onChange={e => setNewInstruction(e.target.value)}
                onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        addInstruction();
                    }
                }}
              />
              <button 
                type="button" 
                onClick={addInstruction}
                className="bg-green-600 text-white px-3 rounded hover:bg-green-700 transition-colors h-10"
              >
                <Plus size={16} />
              </button>
            </div>

            <ol className="space-y-1 list-decimal list-inside">
              {formData.instructions.map((inst, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-gray-50 p-1.5 rounded border border-gray-100 text-sm">
                  <span className="flex-1 whitespace-pre-wrap">{inst}</span>
                  <button
                    type="button"
                    className="text-gray-400 hover:text-red-500 p-0.5 mt-0.5"
                    onClick={() => removeInstruction(idx)}
                  >
                    ✕
                  </button>
                </li>
              ))}
              {formData.instructions.length === 0 && (
                <li className="text-gray-500 italic text-center py-2 bg-gray-50 rounded border border-dashed border-gray-200 list-none text-xs">
                  No instructions yet
                </li>
              )}
            </ol>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <button 
              type="button" 
              onClick={onCancel} 
              className="px-3 py-1.5 text-gray-600 hover:bg-gray-100 rounded text-sm font-medium"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-4 py-1.5 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium shadow-sm text-sm"
            >
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
