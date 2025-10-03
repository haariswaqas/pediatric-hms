// src/components/ui/tabs.jsx
import React, { createContext, useContext, useState } from 'react';

const TabsContext = createContext({
  selectedTab: "",
  setSelectedTab: () => {}
});

export function Tabs({ defaultValue, children, className = "" }) {
  const [selectedTab, setSelectedTab] = useState(defaultValue);

  return (
    <TabsContext.Provider value={{ selectedTab, setSelectedTab }}>
      <div className={`w-full ${className}`}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = "" }) {
  return (
    <div className={`flex space-x-1 rounded-md bg-gray-100 dark:bg-gray-800 p-1 ${className}`}>
      {children}
    </div>
  );
}

export function TabsTrigger({ value, children, className = "" }) {
  const { selectedTab, setSelectedTab } = useContext(TabsContext);
  const isActive = selectedTab === value;

  return (
    <button
      onClick={() => setSelectedTab(value)}
      className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${
        isActive 
          ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm"
          : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = "" }) {
  const { selectedTab } = useContext(TabsContext);
  
  if (value !== selectedTab) return null;
  
  return (
    <div className={`mt-2 rounded-md ${className}`}>
      {children}
    </div>
  );
}