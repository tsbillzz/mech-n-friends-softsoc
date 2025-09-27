
"use client";

import { useState, useEffect } from 'react';
import type { Building } from '@/lib/data';
import { buildings as initialBuildings } from '@/lib/data';
import BuildingView from '@/components/building/building-view';
import CampusMap from '@/components/map/campus-map';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SlidersHorizontal, PersonStanding } from 'lucide-react';
import QuietSpots from '@/components/suggestions/quiet-spots';
import CombinedFilterDialog from '@/components/suggestions/combined-filter-dialog';
import Header from '@/components/layout/header';

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [highlightedBuildingId, setHighlightedBuildingId] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [isClient, setIsClient] = useState(false);
  const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
  
  const mapRef = useState<google.maps.Map | null>(null);

  useEffect(() => {
    setIsClient(true);
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
  
  useEffect(() => {
    if (highlightedBuildingId) {
      const timer = setTimeout(() => {
        setHighlightedBuildingId(null);
      }, 3000); // Highlight for 3 seconds
      return () => clearTimeout(timer);
    }
  }, [highlightedBuildingId]);

  const handleSelectBuilding = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    setSelectedBuilding(building || null);
    setIsFilterDialogOpen(false); // Close dialog when a building is selected
  };

  const handleBackToMap = () => {
    setSelectedBuilding(null);
  };

  if (!isClient) {
    return null;
  }
  
  if (selectedBuilding) {
    return (
      <div className="h-screen w-screen p-4 md:p-8 overflow-auto">
        <BuildingView building={selectedBuilding} onBack={handleBackToMap} />
      </div>
    );
  }

  return (
    <div className="h-screen w-screen relative">
       <div className="absolute top-0 left-0 right-0 z-10">
        <Header />
      </div>
      <CampusMap 
        buildings={buildings} 
        onSelectBuilding={handleSelectBuilding}
        mapRef={mapRef}
        selectedBuildingId={highlightedBuildingId}
      />
      <div className="absolute top-20 right-4 flex flex-col gap-2">
        <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
              <SlidersHorizontal />
            </Button>
          </DialogTrigger>
          <DialogContent>
             <DialogHeader>
              <DialogTitle>Find a PC</DialogTitle>
            </DialogHeader>
             <CombinedFilterDialog 
                buildings={buildings}
                map={mapRef[0]}
                onDialogClose={() => setIsFilterDialogOpen(false)}
                onBuildingSelect={handleSelectBuilding}
                onBuildingHighlight={setHighlightedBuildingId}
             />
          </DialogContent>
        </Dialog>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
              <PersonStanding />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Quiet Spots</DialogTitle>
            </DialogHeader>
            <QuietSpots buildings={buildings} onSelectBuilding={handleSelectBuilding} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
