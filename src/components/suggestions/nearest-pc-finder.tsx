"use client";

import { useState } from 'react';
import type { Building } from '@/lib/data';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, LocateFixed } from 'lucide-react';

type NearestPcFinderProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
  selectedSoftware: string[];
};

type BuildingWithDistance = Building & {
  distance: number;
};

// Haversine distance formula
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

export default function NearestPcFinder({ buildings, onSelectBuilding, selectedSoftware }: NearestPcFinderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nearestBuilding, setNearestBuilding] = useState<BuildingWithDistance | null>(null);

  const handleFindNearest = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser.");
      return;
    }

    setLoading(true);
    setError(null);
    setNearestBuilding(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;

        const availableBuildings = buildings.filter(b => 
          b.floors.flatMap(f => f.pcs).some(pc => 
            pc.status === 'available' &&
            (selectedSoftware.length === 0 || selectedSoftware.every(s => pc.software.includes(s)))
          )
        );

        if (availableBuildings.length === 0) {
          setError("No available PCs found matching your criteria.");
          setLoading(false);
          return;
        }

        const buildingsWithDistance = availableBuildings.map(building => ({
          ...building,
          distance: getDistance(latitude, longitude, building.coordinates.latitude, building.coordinates.longitude),
        }));

        buildingsWithDistance.sort((a, b) => a.distance - b.distance);
        
        setNearestBuilding(buildingsWithDistance[0]);
        setLoading(false);
      },
      (err) => {
        setError(`Unable to retrieve your location: ${err.message}`);
        setLoading(false);
      }
    );
  };

  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <LocateFixed />
          Nearest PC Finder
        </CardTitle>
        <CardDescription>Find the closest building with a PC that meets your software needs.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={handleFindNearest} disabled={loading} className="w-full">
          {loading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LocateFixed className="mr-2 h-4 w-4" />
          )}
          Use My Current Location
        </Button>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
        {error && <p className="text-sm text-destructive text-center w-full">{error}</p>}
        {nearestBuilding && (
          <div className="w-full p-4 bg-primary/10 rounded-md border border-primary/20 text-center">
            <p className="font-semibold text-primary">
              The closest spot is {nearestBuilding.name}
            </p>
            <p className="text-sm text-muted-foreground mb-2">
              (approx. {nearestBuilding.distance.toFixed(2)} km away)
            </p>
            <Button
              variant="link"
              className="p-0 h-auto"
              onClick={() => onSelectBuilding(nearestBuilding.id)}
            >
              Go to Building View
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}
