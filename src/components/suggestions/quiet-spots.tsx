"use client";

import type { Building } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { PersonStanding } from 'lucide-react';
import { useMemo } from 'react';

type QuietSpotsProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
};

type BuildingOccupancy = {
  id: string;
  name: string;
  occupancy: number;
  totalPcs: number;
  availablePcs: number;
};

export default function QuietSpots({ buildings, onSelectBuilding }: QuietSpotsProps) {
  const buildingOccupancy = useMemo<BuildingOccupancy[]>(() => {
    return buildings
      .map(building => {
        const allPcs = building.floors.flatMap(floor => floor.pcs);
        if (allPcs.length === 0) {
          return {
            id: building.id,
            name: building.name,
            occupancy: 0,
            totalPcs: 0,
            availablePcs: 0,
          };
        }
        const occupiedPcs = allPcs.filter(pc => pc.status === 'occupied').length;
        const availablePcs = allPcs.filter(pc => pc.status === 'available').length;
        const totalComputers = allPcs.filter(pc => pc.status === 'available' || pc.status === 'occupied').length;

        const occupancy = totalComputers > 0 ? Math.round((occupiedPcs / totalComputers) * 100) : 0;
        
        return {
          id: building.id,
          name: building.name,
          occupancy,
          totalPcs: allPcs.length,
          availablePcs,
        };
      })
      .sort((a, b) => a.occupancy - b.occupancy);
  }, [buildings]);

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <PersonStanding />
          Quiet Spots Finder
        </CardTitle>
        <CardDescription>Find buildings with the lowest PC occupancy right now.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {buildingOccupancy.map(building => (
          <div key={building.id}>
            <div className="flex justify-between items-center mb-1">
              <Button
                variant="link"
                className="p-0 h-auto text-base font-semibold"
                onClick={() => onSelectBuilding(building.id)}
              >
                {building.name}
              </Button>
              <span className="text-sm font-bold text-primary">{building.occupancy}% full</span>
            </div>
            <Progress value={building.occupancy} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {building.availablePcs} of {building.totalPcs} PCs available
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
