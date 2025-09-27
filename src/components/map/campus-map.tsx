
'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Building } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
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

  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentPosition({ lat: latitude, lng: longitude });
        },
        (error) => {
          console.error("Error getting user's location", error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);
  
  const initialCenter = useMemo(() => {
    if (buildings.length === 0) {
      return { lat: -33.88, lng: 151.19 }; // Default center
    }
    const avgLat = buildings.reduce((sum, b) => sum + b.coordinates.latitude, 0) / buildings.length;
    const avgLng = buildings.reduce((sum, b) => sum + b.coordinates.longitude, 0) / buildings.length;
    return { lat: avgLat, lng: avgLng };
  }, [buildings]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    mapInstance.setCenter(initialCenter);
    setMap(mapInstance);
  }, [initialCenter]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

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
        zoom={16}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {buildings.map((building) => (
          <Marker
            key={building.id}
            position={{ lat: building.coordinates.latitude, lng: building.coordinates.longitude }}
            onClick={() => onSelectBuilding(building.id)}
            title={building.name}
          />
        ))}
        {currentPosition && (
          <Circle
            center={currentPosition}
            radius={20} // Radius in meters
            options={{
              strokeColor: '#4285F4',
              strokeOpacity: 1,
              strokeWeight: 2,
              fillColor: '#4285F4',
              fillOpacity: 0.5,
            }}
          />
        )}
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
