
'use client';

import type { Dispatch, SetStateAction } from 'react';
import { useState, useCallback, useRef } from 'react';
import type { Building } from '@/lib/data';
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { Skeleton } from '../ui/skeleton';

type CampusMapProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
  mapRef: [google.maps.Map | null, Dispatch<SetStateAction<google.maps.Map | null>>];
  selectedBuildingId: string | null;
};

export default function CampusMap({ buildings, onSelectBuilding, mapRef, selectedBuildingId }: CampusMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const [map, setMap] = mapRef;
  const hasCenteredOnUser = useRef(false);
  
  const initialCenter = { lat: -33.88, lng: 151.19 };

  const onLoad = useCallback((mapInstance: google.maps.Map) => {
    setMap(mapInstance);
    // Center on user's location once the map loads
    if (navigator.geolocation && !hasCenteredOnUser.current) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const userPosition = { lat: latitude, lng: longitude };
          
          if (!hasCenteredOnUser.current) {
             mapInstance.panTo(userPosition);
             mapInstance.setZoom(17);
             hasCenteredOnUser.current = true;
          }
        },
        (error) => {
          console.error("Error getting user's location", error);
          // Fallback to initial center if location is denied
          mapInstance.panTo(initialCenter);
        }
      );
    }
  }, [setMap, initialCenter]);

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
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          disableDefaultUI: true,
          zoomControl: true,
          // Set initial center but don't bind it to state to allow free panning
          center: initialCenter,
          zoom: 16,
        }}
      >
        {buildings.map((building) => (
          <Marker
            key={building.id}
            position={{ lat: building.coordinates.latitude, lng: building.coordinates.longitude }}
            onClick={() => onSelectBuilding(building.id)}
            title={building.name}
            animation={
              selectedBuildingId === building.id
                ? google.maps.Animation.BOUNCE
                : undefined
            }
          />
        ))}
      </GoogleMap>
    );
  };

  return <>{renderMap()}</>;
}
