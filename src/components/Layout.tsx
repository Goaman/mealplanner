import React from 'react';
import { Calendar, ChefHat, ShoppingCart, Menu } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'planner' | 'recipes' | 'shopping';
  onTabChange: (tab: 'planner' | 'recipes' | 'shopping') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-8 px-2">
          <ChefHat className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-800">MealPlanner</h1>
        </div>
        
        <nav className="flex flex-col gap-2">
          <NavButton 
            icon={<Calendar />} 
            label="Weekly Plan" 
            isActive={activeTab === 'planner'} 
            onClick={() => onTabChange('planner')}
          />
          <NavButton 
            icon={<Menu />} 
            label="Recipes" 
            isActive={activeTab === 'recipes'} 
            onClick={() => onTabChange('recipes')}
          />
          <NavButton 
            icon={<ShoppingCart />} 
            label="Shopping List" 
            isActive={activeTab === 'shopping'} 
            onClick={() => onTabChange('shopping')}
          />
        </nav>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ChefHat className="h-6 w-6 text-blue-600" />
          <h1 className="text-xl font-bold text-gray-800">MealPlanner</h1>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto h-[calc(100vh-64px)] md:h-screen p-4 md:p-8">
        {children}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-4">
        <MobileNavButton 
          icon={<Calendar />} 
          label="Plan" 
          isActive={activeTab === 'planner'} 
          onClick={() => onTabChange('planner')}
        />
        <MobileNavButton 
          icon={<Menu />} 
          label="Recipes" 
          isActive={activeTab === 'recipes'} 
          onClick={() => onTabChange('recipes')}
        />
        <MobileNavButton 
          icon={<ShoppingCart />} 
          label="Shop" 
          isActive={activeTab === 'shopping'} 
          onClick={() => onTabChange('shopping')}
        />
      </div>
    </div>
  );
}

function NavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-50 text-blue-600 font-medium' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 20 })}
      {label}
    </button>
  );
}

function MobileNavButton({ icon, label, isActive, onClick }: { icon: React.ReactNode, label: string, isActive: boolean, onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 ${
        isActive ? 'text-blue-600' : 'text-gray-500'
      }`}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      <span className="text-xs">{label}</span>
    </button>
  );
}

