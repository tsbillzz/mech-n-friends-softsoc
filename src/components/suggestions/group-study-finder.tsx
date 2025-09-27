
"use client";

import type { Building, PC } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users } from 'lucide-react';
import { useMemo } from 'react';

type GroupStudyFinderProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
};

type GroupSpot = {
  buildingId: string;
  buildingName: string;
  floorName: string;
  clusterId: number;
  availablePcs: number;
  totalPcsInCluster: number;
};

export default function GroupStudyFinder({ buildings, onSelectBuilding }: GroupStudyFinderProps) {
  const groupSpots = useMemo<GroupSpot[]>(() => {
    const spots: GroupSpot[] = [];

    buildings.forEach(building => {
      building.floors.forEach(floor => {
        const pcsByCluster: { [key: number]: PC[] } = {};
        floor.pcs.forEach(pc => {
          if (pc.clusterId) {
            if (!pcsByCluster[pc.clusterId]) {
              pcsByCluster[pc.clusterId] = [];
            }
            pcsByCluster[pc.clusterId].push(pc);
          }
        });

        Object.values(pcsByCluster).forEach(cluster => {
          const availablePcsInCluster = cluster.filter(pc => pc.status === 'available');
          if (availablePcsInCluster.length > 1) { // Only show clusters with 2+ available PCs
            spots.push({
              buildingId: building.id,
              buildingName: building.name,
              floorName: floor.name,
              clusterId: cluster[0].clusterId!,
              availablePcs: availablePcsInCluster.length,
              totalPcsInCluster: cluster.length,
            });
          }
        });
      });
    });

    return spots.sort((a, b) => b.availablePcs - a.availablePcs);
  }, [buildings]);

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <Users />
          Group Study Finder
        </CardTitle>
        <CardDescription>Find clusters of available computers for group work.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 max-h-64 overflow-y-auto">
        {groupSpots.length > 0 ? (
          groupSpots.map((spot, index) => (
            <div key={index} className="p-2 border rounded-md">
              <div className="flex justify-between items-center mb-1">
                <Button
                  variant="link"
                  className="p-0 h-auto text-base font-semibold"
                  onClick={() => onSelectBuilding(spot.buildingId)}
                >
                  {spot.buildingName}
                </Button>
                <span className="text-sm font-bold text-primary">
                  {spot.availablePcs} / {spot.totalPcsInCluster} free
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {spot.floorName} - Cluster {spot.clusterId}
              </p>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground text-center">No group spots with 2+ available PCs found right now.</p>
        )}
      </CardContent>
    </Card>
  );
}
