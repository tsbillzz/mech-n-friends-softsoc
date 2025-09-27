'use client';

import { useMemo } from 'react';
import type { Building } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Skeleton } from '../ui/skeleton';

type CampusMapProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

export default function CampusMap({ buildings, onSelectBuilding }: CampusMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const center = useMemo(() => {
    if (buildings.length === 0) {
      return { lat: -33.88, lng: 151.19 }; // Default center
    }
    const avgLat = buildings.reduce((sum, b) => sum + b.coordinates.latitude, 0) / buildings.length;
    const avgLng = buildings.reduce((sum, b) => sum + b.coordinates.longitude, 0) / buildings.length;
    return { lat: avgLat, lng: avgLng };
  }, [buildings]);

  const renderMap = () => {
    if (loadError) {
      return <div className='flex items-center justify-center h-full'>Error loading map</div>;
    }

    if (!isLoaded) {
      return <Skeleton className="w-full h-full" />;
    }

    return (
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={16}
      >
        {buildings.map((building) => (
          <Marker
            key={building.id}
            position={{ lat: building.coordinates.latitude, lng: building.coordinates.longitude }}
            onClick={() => onSelectBuilding(building.id)}
            title={building.name}
          />
        ))}
      </GoogleMap>
    );
  };

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Campus Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden border">
          {renderMap()}
        </div>
        <div className="mt-4 text-center">
          <p className="text-muted-foreground">Click on a building to see PC availability.</p>
        </div>
      </CardContent>
    </Card>
  );
}
