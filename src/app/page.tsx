"use client";

import { useState } from 'react';
import type { Building } from '@/lib/data';
import { buildings } from '@/lib/data';
import Header from '@/components/layout/header';
import CampusMap from '@/components/map/campus-map';
import BuildingView from '@/components/building/building-view';

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);

  const handleSelectBuilding = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    setSelectedBuilding(building || null);
  };

  const handleBackToMap = () => {
    setSelectedBuilding(null);
  };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground font-body">
      <Header />
      <main className="flex-1 overflow-auto p-4 md:p-8">
        <div className="container mx-auto h-full">
          {selectedBuilding ? (
            <BuildingView building={selectedBuilding} onBack={handleBackToMap} />
          ) : (
            <CampusMap buildings={buildings} onSelectBuilding={handleSelectBuilding} />
          )}
        </div>
      </main>
    </div>
  );
}
