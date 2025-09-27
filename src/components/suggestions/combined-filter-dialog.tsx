
"use client";

import { useState } from 'react';
import type { Building, PC } from '@/lib/data';
import { allSoftware } from '@/lib/data';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { LocateFixed, Users, Loader2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type CombinedFilterDialogProps = {
  buildings: Building[];
  map: google.maps.Map | null;
  onDialogClose: () => void;
  onBuildingSelect: (buildingId: string) => void;
  onBuildingHighlight: (buildingId: string) => void;
};

type BuildingWithDistance = Building & { distance: number };

const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    0.5 - Math.cos(dLat) / 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    (1 - Math.cos(dLon)) / 2;
  return R * 2 * Math.asin(Math.sqrt(a));
};

export default function CombinedFilterDialog({ buildings, map, onDialogClose, onBuildingSelect, onBuildingHighlight }: CombinedFilterDialogProps) {
  const [selectedBuilding, setSelectedBuilding] = useState<string>('');
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [isGroupFinderEnabled, setIsGroupFinderEnabled] = useState(false);
  const [isFinding, setIsFinding] = useState(false);
  const { toast } = useToast();

  const handleSoftwareChange = (software: string) => {
    setSelectedSoftware(prev =>
      prev.includes(software)
        ? prev.filter(s => s !== software)
        : [...prev, software]
    );
  };

  const findIdealPC = () => {
    setIsFinding(true);
    if (selectedBuilding) {
      const building = buildings.find(b => b.id === selectedBuilding);
      if (building && hasMatchingPc(building)) {
        toast({
          title: "Spot Found!",
          description: `An available spot matching your criteria was found in ${building.name}.`,
          duration: 3000,
        });
        onBuildingHighlight(building.id);
        map?.panTo({ lat: building.coordinates.latitude, lng: building.coordinates.longitude });
        map?.setZoom(18);
        onDialogClose();
      } else {
        toast({
          variant: "destructive",
          title: "No Spots Found",
          description: `No available computers found in ${building?.name} matching your criteria.`,
        });
      }
      setIsFinding(false);
    } else {
      findNearest();
    }
  };
  
  const hasMatchingPc = (building: Building): boolean => {
    if (isGroupFinderEnabled) {
      return building.floors.some(floor => {
        const pcsByCluster: { [key: number]: PC[] } = {};
        floor.pcs.forEach(pc => {
          if (pc.clusterId) {
            if (!pcsByCluster[pc.clusterId]) pcsByCluster[pc.clusterId] = [];
            pcsByCluster[pc.clusterId].push(pc);
          }
        });
        return Object.values(pcsByCluster).some(cluster => {
          const availablePcsInCluster = cluster.filter(pc =>
            pc.status === 'available' &&
            (selectedSoftware.length === 0 || selectedSoftware.every(s => pc.software.includes(s)))
          );
          return availablePcsInCluster.length > 1;
        });
      });
    } else {
      return building.floors.flatMap(f => f.pcs).some(pc => 
        pc.status === 'available' &&
        (selectedSoftware.length === 0 || selectedSoftware.every(s => pc.software.includes(s)))
      );
    }
  };

  const findNearest = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const matchingBuildings = buildings.filter(b => hasMatchingPc(b));

        if (matchingBuildings.length === 0) {
          toast({
            variant: "destructive",
            title: "No Spots Found",
            description: "No available computers found anywhere matching your criteria.",
          });
          setIsFinding(false);
          return;
        }

        const buildingsWithDistance = matchingBuildings.map(building => ({
          ...building,
          distance: getDistance(latitude, longitude, building.coordinates.latitude, building.coordinates.longitude),
        }));

        const nearestBuilding = buildingsWithDistance.sort((a, b) => a.distance - b.distance)[0];
        
        toast({
            title: "Nearest PC Found!",
            description: `The closest available spot is in ${nearestBuilding.name}.`,
            duration: 3000,
        });
        
        onBuildingHighlight(nearestBuilding.id);
        map?.panTo({ lat: nearestBuilding.coordinates.latitude, lng: nearestBuilding.coordinates.longitude });
        map?.setZoom(18);

        onDialogClose();
        setIsFinding(false);
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location not available",
          description: "Could not determine your current location. Please enable location services or select a building.",
        });
        setIsFinding(false);
      }
    );
  };

  return (
    <Card className="shadow-none border-none">
      <CardContent className="space-y-6 pt-6">
        <div>
            <Label className="font-semibold">Building (Optional)</Label>
            <Select onValueChange={setSelectedBuilding} value={selectedBuilding}>
              <SelectTrigger>
                <SelectValue placeholder="Any building (find nearest)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Any building (find nearest)</SelectItem>
                {buildings.map(b => <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>)}
              </SelectContent>
            </Select>
        </div>
        <div className="space-y-2">
            <Label className="font-semibold">Software</Label>
            <div className="grid grid-cols-2 gap-4 max-h-48 overflow-y-auto p-1">
                {allSoftware.map(software => (
                <div key={software} className="flex items-center space-x-2">
                    <Checkbox
                    id={`filter-${software}`}
                    checked={selectedSoftware.includes(software)}
                    onCheckedChange={() => handleSoftwareChange(software)}
                    />
                    <Label htmlFor={`filter-${software}`} className="text-sm font-medium leading-none">
                    {software}
                    </Label>
                </div>
                ))}
            </div>
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3 shadow-sm">
            <div className="space-y-0.5">
                <Label htmlFor="group-finder" className="flex items-center gap-2 font-semibold"><Users />Enable Group Study Finder</Label>
                <p className="text-xs text-muted-foreground">
                    Find clusters of 2+ available PCs.
                </p>
            </div>
            <Switch
                id="group-finder"
                checked={isGroupFinderEnabled}
                onCheckedChange={setIsGroupFinderEnabled}
            />
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={findIdealPC} className="w-full" disabled={isFinding}>
            {isFinding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <LocateFixed className="mr-2" />
            )}
            {isFinding ? 'Finding...' : 'Find PC'}
        </Button>
      </CardFooter>
    </Card>
  );
}
