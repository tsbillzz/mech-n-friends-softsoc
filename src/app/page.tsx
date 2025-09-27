"use client";

import { useState, useEffect } from 'react';
import type { Building } from '@/lib/data';
import { buildings as initialBuildings } from '@/lib/data';
import Header from '@/components/layout/header';
import CampusMap from '@/components/map/campus-map';
import BuildingView from '@/components/building/building-view';
import SuggestionWidgets from '@/components/suggestions/suggestion-widgets';

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setBuildings(currentBuildings => {
        return currentBuildings.map(building => {
          const newBuildingData = JSON.parse(JSON.stringify(building));
          
          if (newBuildingData.floors.length === 0) return newBuildingData;

          const randomFloorIndex = Math.floor(Math.random() * newBuildingData.floors.length);
          const floor = newBuildingData.floors[randomFloorIndex];

          if (floor && floor.pcs.length > 0) {
            const nonSpecialStatusPcs = floor.pcs.filter((pc: { status: string; }) => pc.status !== 'broken' && pc.status !== 'under maintenance');
            if (nonSpecialStatusPcs.length > 0) {
              const randomPcIndex = Math.floor(Math.random() * nonSpecialStatusPcs.length);
              const pcToToggle = nonSpecialStatusPcs[randomPcIndex];
              
              const originalPc = floor.pcs.find((p: { id: any; }) => p.id === pcToToggle.id);
              if (originalPc) {
                originalPc.status = originalPc.status === 'available' ? 'occupied' : 'available';
              }
            }
          }
          return newBuildingData;
        });
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, []);

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
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              <div className="w-full lg:w-2/3">
                <CampusMap buildings={buildings} onSelectBuilding={handleSelectBuilding} />
              </div>
              <div className="w-full lg:w-1/3">
                <SuggestionWidgets buildings={buildings} onSelectBuilding={handleSelectBuilding} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
