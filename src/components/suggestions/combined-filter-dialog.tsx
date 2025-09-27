
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
import { SlidersHorizontal, LocateFixed, Users } from 'lucide-react';

type CombinedFilterDialogProps = {
  buildings: Building[];
  map: google.maps.Map | null;
  onDialogClose: () => void;
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

export default function CombinedFilterDialog({ buildings, map, onDialogClose }: CombinedFilterDialogProps) {
  const [selectedSoftware, setSelectedSoftware] = useState<string[]>([]);
  const [isGroupFinderEnabled, setIsGroupFinderEnabled] = useState(false);
  const { toast } = useToast();

  const handleSoftwareChange = (software: string) => {
    setSelectedSoftware(prev =>
      prev.includes(software)
        ? prev.filter(s => s !== software)
        : [...prev, software]
    );
  };

  const findNearest = () => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const currentPosition = { lat: latitude, lng: longitude };

        let nearestBuilding: BuildingWithDistance | null = null;

        if (isGroupFinderEnabled) {
          nearestBuilding = findNearestGroupSpot(currentPosition);
        } else {
          nearestBuilding = findNearestSinglePC(currentPosition);
        }

        if (nearestBuilding) {
            onDialogClose();
            toast({
                title: "Nearest PC Found!",
                description: `The closest available spot is in ${nearestBuilding.name}.`,
                duration: 3000,
            });
            drawDirections(currentPosition, nearestBuilding);
        } else {
            toast({
                variant: "destructive",
                title: "No Spots Found",
                description: "No available computers found matching your criteria.",
            });
        }
      },
      () => {
        toast({
          variant: "destructive",
          title: "Location not available",
          description: "Could not determine your current location. Please enable location services.",
        });
      }
    );
  };

  const findNearestSinglePC = (currentPosition: { lat: number; lng: number }): BuildingWithDistance | null => {
    const availableBuildings = buildings.filter(b => 
      b.floors.flatMap(f => f.pcs).some(pc => 
        pc.status === 'available' &&
        (selectedSoftware.length === 0 || selectedSoftware.every(s => pc.software.includes(s)))
      )
    );

    if (availableBuildings.length === 0) return null;

    const buildingsWithDistance = availableBuildings.map(building => ({
      ...building,
      distance: getDistance(currentPosition.lat, currentPosition.lng, building.coordinates.latitude, building.coordinates.longitude),
    }));

    return buildingsWithDistance.sort((a, b) => a.distance - b.distance)[0];
  };

  const findNearestGroupSpot = (currentPosition: { lat: number; lng: number }): BuildingWithDistance | null => {
      const buildingsWithGroupSpots = buildings.filter(building => {
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
                  return availablePcsInCluster.length > 1; // At least 2 PCs for a group spot
              });
          });
      });

      if (buildingsWithGroupSpots.length === 0) return null;

      const buildingsWithDistance = buildingsWithGroupSpots.map(building => ({
          ...building,
          distance: getDistance(currentPosition.lat, currentPosition.lng, building.coordinates.latitude, building.coordinates.longitude),
      }));

      return buildingsWithDistance.sort((a, b) => a.distance - b.distance)[0];
  };


  const drawDirections = (origin: { lat: number; lng: number }, destinationBuilding: Building) => {
    if (!map || !window.google || !window.google.maps) {
      console.error("Google Maps API not loaded or map not ready.");
      return;
    }
    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: new window.google.maps.LatLng(origin.lat, origin.lng),
        destination: new window.google.maps.LatLng(destinationBuilding.coordinates.latitude, destinationBuilding.coordinates.longitude),
        travelMode: window.google.maps.TravelMode.WALKING,
      },
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK && result) {
            const directionsRenderer = new window.google.maps.DirectionsRenderer({
                directions: result,
                suppressMarkers: true,
                polylineOptions: {
                  strokeColor: '#FF0000',
                  strokeOpacity: 0.8,
                  strokeWeight: 6,
                },
              });
            directionsRenderer.setMap(map);
        } else {
          console.error(`error fetching directions ${result}`);
          toast({
            variant: "destructive",
            title: "Directions Error",
            description: `Could not fetch directions: ${status}`,
          });
        }
      }
    );
  };


  return (
    <Card className="shadow-none border-none">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <SlidersHorizontal />
          Find a PC
        </CardTitle>
        <CardDescription>Select software and find the nearest spot.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
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
        <Button onClick={findNearest} className="w-full">
            <LocateFixed className="mr-2" /> Find Nearest PC
        </Button>
      </CardFooter>
    </Card>
  );
}
