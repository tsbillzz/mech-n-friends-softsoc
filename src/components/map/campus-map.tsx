
'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Building } from '@/lib/data';
import { GoogleMap, useJsApiLoader, Marker, Circle } from '@react-google-maps/api';
import { Skeleton } from '../ui/skeleton';
import { useToast } from '@/hooks/use-toast';

type CampusMapProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
  mapRef: [google.maps.Map | null, Dispatch<SetStateAction<google.maps.Map | null>>];
};

export default function CampusMap({ buildings, onSelectBuilding, mapRef }: CampusMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = mapRef;
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
      return { lat: -33.88, lng: 151.19 };
    }
    const avgLat = buildings.reduce((sum, b) => sum + b.coordinates.latitude, 0) / buildings.length;
    const avgLng = buildings.reduce((sum, b) => sum + b.coordinates.longitude, 0) / buildings.length;
    return { lat: avgLat, lng: avgLng };
  }, [buildings]);

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
  }, [setMap]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, [setMap]);

  const renderMap = () => {
    if (loadError) {
      return <div className='flex items-center justify-center h-full'>Error loading map</div>;
    }

    if (!isLoaded) {
      return <Skeleton className="w-full h-full" />;
    }

    return (
      <GoogleMap
        mapContainerStyle={{ width: '100%', height: '100%' }}
        center={initialCenter}
        zoom={16}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
        }}
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
            radius={10}
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

  return <>{renderMap()}</>;
}
