import React from 'react';
import { Waves } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-teal-800 text-white p-4 shadow-md flex items-center justify-between shrink-0 z-10">
      <div className="flex items-center gap-3 max-w-4xl mx-auto w-full">
        <div className="bg-teal-700 p-2 rounded-lg">
          <Waves size={28} className="text-teal-100" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">Coastal GA Water Resilience</h1>
          <p className="text-teal-200 text-sm">Community Infrastructure & Safety Assistant</p>
        </div>
      </div>
    </header>
  );
};