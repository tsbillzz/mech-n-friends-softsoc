"use client";

import { useState, useEffect } from 'react';
import type { Building } from '@/lib/data';
import { buildings as initialBuildings } from '@/lib/data';
import BuildingView from '@/components/building/building-view';
import CampusMap from '@/components/map/campus-map';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { SlidersHorizontal, Users, PersonStanding, LocateFixed } from 'lucide-react';
import SoftwareFilter from '@/components/suggestions/software-filter';
import QuietSpots from '@/components/suggestions/quiet-spots';
import GroupStudyFinder from '@/components/suggestions/group-study-finder';

export default function Home() {
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [buildings, setBuildings] = useState<Building[]>(initialBuildings);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [isClient, setIsClient] = useState(false);

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

  const handleSelectBuilding = (buildingId: string) => {
    const building = buildings.find(b => b.id === buildingId);
    setSelectedBuilding(building || null);
  };

  const handleBackToMap = () => {
    setSelectedBuilding(null);
  };

  const handleSoftwareChange = (software: string) => {
    setSelectedSoftware(prev =>
      prev.includes(software)
        ? prev.filter(s => s !== software)
        : [...prev, software]
    );
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
      <CampusMap 
        buildings={buildings} 
        onSelectBuilding={handleSelectBuilding}
        selectedSoftware={selectedSoftware}
      />
      <div className="absolute top-4 right-4 flex flex-col gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button size="icon" className="rounded-full h-12 w-12 shadow-lg">
              <SlidersHorizontal />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Filters & Study Spaces</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <SoftwareFilter selectedSoftware={selectedSoftware} onSoftwareChange={handleSoftwareChange} />
              <GroupStudyFinder buildings={buildings} onSelectBuilding={handleSelectBuilding} />
            </div>
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
