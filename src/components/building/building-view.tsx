'use client';

import { useState, useEffect } from 'react';
import type { Building } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft } from 'lucide-react';
import FloorPlan from './floor-plan';
import AvailabilityForecaster from '../forecaster/availability-forecaster';

type BuildingViewProps = {
  building: Building;
  onBack: () => void;
};

export default function BuildingView({ building, onBack }: BuildingViewProps) {
  const [localBuilding, setLocalBuilding] = useState(building);
  const defaultTab = building.floors[0]?.id;

  useEffect(() => {
    setLocalBuilding(building);

    const intervalId = setInterval(() => {
      setLocalBuilding(currentBuilding => {
        const newBuildingData = JSON.parse(JSON.stringify(currentBuilding));
        
        const randomFloorIndex = Math.floor(Math.random() * newBuildingData.floors.length);
        const floor = newBuildingData.floors[randomFloorIndex];

        if (floor && floor.pcs.length > 0) {
          const randomPcIndex = Math.floor(Math.random() * floor.pcs.length);
          const pc = floor.pcs[randomPcIndex];
          pc.status = pc.status === 'available' ? 'occupied' : 'available';
        }
        
        return newBuildingData;
      });
    }, 2000);

    return () => clearInterval(intervalId);
  }, [building]);


  if (!defaultTab) {
    return (
      <div>
        <Button onClick={onBack} variant="ghost"><ArrowLeft className="mr-2" /> Back to Map</Button>
        <p className="mt-4">This building has no floor plans available.</p>
      </div>
    );
  }

  return (
    <div className="animate-in fade-in-50 duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Button onClick={onBack} variant="ghost" className="mb-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campus Map
          </Button>
          <h2 className="text-4xl font-bold font-headline">{localBuilding.name}</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-emerald-500" />
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-rose-500" />
            <span className="text-sm">Occupied</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList>
                {localBuilding.floors.map((floor) => (
                  <TabsTrigger key={floor.id} value={floor.id}>
                    {floor.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {localBuilding.floors.map((floor) => (
                <TabsContent key={floor.id} value={floor.id}>
                  <FloorPlan floor={floor} />
                </TabsContent>
              ))}
            </Tabs>
        </div>
        <div className="lg:col-span-1">
          <AvailabilityForecaster buildingName={localBuilding.name} />
        </div>
      </div>
    </div>
  );
}
