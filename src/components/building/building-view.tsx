'use client';

import { useState, useEffect, useMemo } from 'react';
import type { Building, PC } from '@/lib/data';
import { allSoftware } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, SlidersHorizontal, Triangle, Wrench, Users } from 'lucide-react';
import FloorPlan from './floor-plan';
import AvailabilityForecaster from '../forecaster/availability-forecaster';
import AdminLoginModal from './admin-login-modal';

const floorImageMap: { [key: string]: string } = {
  'f-3': '/images/fisher-floor-1.png',
  'f-3-2': '/images/fisher-floor-2.png',
  's-3': '/images/scitech-floor-3.png',
  'l-1': '/images/law-floor-1.png',
  'l-2': '/images/law-floor-2.png',
  'bh-1': '/images/placeholder-floor.png',
  'pnr-2': '/images/placeholder-floor.png',
  'bm-4': '/images/placeholder-floor.png',
};


type BuildingViewProps = {
  building: Building;
  onBack: () => void;
};

export default function BuildingView({ building, onBack }: BuildingViewProps) {
  const [localBuilding, setLocalBuilding] = useState(building);
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedPc, setSelectedPc] = useState<PC | null>(null);
  const defaultTab = building.floors[0]?.id;

  useEffect(() => {
    setLocalBuilding(building);
    setSelectedSoftware([]);

    const intervalId = setInterval(() => {
      setLocalBuilding(currentBuilding => {
        const newBuildingData = JSON.parse(JSON.stringify(currentBuilding));
        
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
    }, 2000);

    return () => clearInterval(intervalId);
  }, [building]);

  const handleSoftwareChange = (software: string) => {
    setSelectedSoftware(prev =>
      prev.includes(software)
        ? prev.filter(s => s !== software)
        : [...prev, software]
    );
  };
  
  const handleToggleBrokenStatus = (pcId: string) => {
    setLocalBuilding(currentBuilding => {
      const newBuildingData = JSON.parse(JSON.stringify(currentBuilding));
      for (const floor of newBuildingData.floors) {
        const pc = floor.pcs.find((p: { id: string; }) => p.id === pcId);
        if (pc) {
          pc.status = pc.status === 'broken' ? 'available' : 'broken';
          break;
        }
      }
      return newBuildingData;
    });
  };
  
  const handleOpenMaintenanceModal = (pcId: string) => {
    for (const floor of localBuilding.floors) {
      const pc = floor.pcs.find(p => p.id === pcId);
      if (pc) {
        setSelectedPc(pc);
        setIsLoginModalOpen(true);
        break;
      }
    }
  };

  const handleToggleMaintenanceStatus = () => {
    if (!selectedPc) return;
    
    setLocalBuilding(currentBuilding => {
      const newBuildingData = JSON.parse(JSON.stringify(currentBuilding));
      for (const floor of newBuildingData.floors) {
        const pc = floor.pcs.find((p: { id: string; }) => p.id === selectedPc.id);
        if (pc) {
          pc.status = pc.status === 'under maintenance' ? 'available' : 'under maintenance';
          break;
        }
      }
      return newBuildingData;
    });
    setIsLoginModalOpen(false);
    setSelectedPc(null);
  };

  const filteredBuilding = useMemo(() => {
    if (selectedSoftware.length === 0) {
      return localBuilding;
    }
    return {
      ...localBuilding,
      floors: localBuilding.floors.map(floor => ({
        ...floor,
        pcs: floor.pcs.filter(pc =>
          pc.status !== 'broken' && 
          pc.status !== 'under maintenance' &&
          pc.status === 'available' && 
          selectedSoftware.every(s => pc.software.includes(s))
        ),
      })),
    };
  }, [localBuilding, selectedSoftware]);

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
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-4">
        <div>
          <Button onClick={onBack} variant="ghost" className="mb-2 -ml-4 md:-ml-2">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Campus Map
          </Button>
          <h2 className="text-3xl md:text-4xl font-bold font-headline">{localBuilding.name}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-emerald-500" />
            <span className="text-xs md:text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-rose-500" />
            <span className="text-xs md:text-sm">Occupied</span>
          </div>
          <div className="flex items-center gap-2">
            <Triangle className="w-3 h-3 md:w-4 md:h-4 text-yellow-500 fill-current" />
            <span className="text-xs md:text-sm">Broken</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench className="w-3 h-3 md:w-4 md:h-4 text-blue-500" />
            <span className="text-xs md:text-sm">Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-3 h-3 md:w-4 md:h-4 text-purple-500" />
            <span className="text-xs md:text-sm">Group Area</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 md:w-4 md:h-4 rounded-full bg-gray-400" />
            <span className="text-xs md:text-sm">Filtered Out</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2">
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList>
                {localBuilding.floors.map((floor) => (
                  <TabsTrigger key={floor.id} value={floor.id}>
                    {floor.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {localBuilding.floors.map((floor) => {
                const originalFloor = localBuilding.floors.find(f => f.id === floor.id);
                const filteredFloor = filteredBuilding.floors.find(f => f.id === floor.id);
                const mapImage = floorImageMap[floor.id] || '/images/placeholder-floor.png';
                return (
                  <TabsContent key={floor.id} value={floor.id}>
                    <FloorPlan 
                      key={JSON.stringify(filteredFloor?.pcs)} 
                      originalPcs={originalFloor?.pcs || []}
                      filteredPcs={filteredFloor?.pcs || []}
                      isFiltered={selectedSoftware.length > 0}
                      onToggleBrokenStatus={handleToggleBrokenStatus}
                      onToggleMaintenanceStatus={handleOpenMaintenanceModal}
                      mapImage={mapImage}
                    />
                  </TabsContent>
                )
              })}
            </Tabs>
        </div>
        <div className="lg:col-span-1 space-y-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline text-2xl flex items-center gap-2">
                <SlidersHorizontal />
                Software Filter
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4">
              {allSoftware.map(software => (
                <div key={software} className="flex items-center space-x-2">
                  <Checkbox
                    id={software}
                    checked={selectedSoftware.includes(software)}
                    onCheckedChange={() => handleSoftwareChange(software)}
                  />
                  <Label htmlFor={software} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {software}
                  </Label>
                </div>
              ))}
            </CardContent>
          </Card>
          <AvailabilityForecaster buildingName={localBuilding.name} />
        </div>
      </div>
      {selectedPc && (
        <AdminLoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          onSuccess={handleToggleMaintenanceStatus}
          pc={selectedPc}
        />
      )}
    </div>
  );
}
