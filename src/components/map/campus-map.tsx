
'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import type { Building } from '@/lib/data';
import { GoogleMap, useJsApiLoader, Marker, Circle, DirectionsRenderer } from '@react-google-maps/api';
import { Skeleton } from '../ui/skeleton';
import { Button } from '@/components/ui/button';
import { LocateFixed } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

type CampusMapProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
  selectedSoftware: string[];
};

const containerStyle = {
  width: '100%',
  height: '100%',
};

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

export default function CampusMap({ buildings, onSelectBuilding, selectedSoftware }: CampusMapProps) {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ''
  });

  const mapRef = useRef<google.maps.Map | null>(null);
  const [currentPosition, setCurrentPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const { toast } = useToast();

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

  const onLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const onUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleFindNearestPC = () => {
    if (!currentPosition) {
      toast({
        variant: "destructive",
        title: "Location not available",
        description: "Could not determine your current location. Please enable location services.",
      });
      return;
    }

    const availableBuildings = buildings.filter(b => 
      b.floors.flatMap(f => f.pcs).some(pc => 
        pc.status === 'available' &&
        (selectedSoftware.length === 0 || selectedSoftware.every(s => pc.software.includes(s)))
      )
    );

    if (availableBuildings.length === 0) {
      toast({
        variant: "destructive",
        title: "No PCs Found",
        description: "No available PCs found matching your current filter criteria.",
      });
      return;
    }

    const buildingsWithDistance = availableBuildings.map(building => ({
      ...building,
      distance: getDistance(currentPosition.lat, currentPosition.lng, building.coordinates.latitude, building.coordinates.longitude),
    }));

    buildingsWithDistance.sort((a, b) => a.distance - b.distance);
    const nearestBuilding = buildingsWithDistance[0];

    toast({
      title: "Nearest PC Found!",
      description: `The closest available PC is in ${nearestBuilding.name}.`,
      duration: 3000,
    });
    
    setTimeout(() => {
      if (!window.google || !window.google.maps) {
        console.error("Google Maps API not loaded.");
        return;
      }
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: new window.google.maps.LatLng(currentPosition.lat, currentPosition.lng),
          destination: new window.google.maps.LatLng(nearestBuilding.coordinates.latitude, nearestBuilding.coordinates.longitude),
          travelMode: window.google.maps.TravelMode.WALKING,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            setDirections(result);
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
    }, 1000); // Delay to allow toast to be seen
  };

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
        {directions && (
          <DirectionsRenderer
            options={{
              directions: directions,
              suppressMarkers: true,
              polylineOptions: {
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeWeight: 6,
              },
            }}
          />
        )}
      </GoogleMap>
    );
  };

  return (
    <>
      {renderMap()}
      <Button 
        size="icon" 
        className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full h-14 w-14 shadow-lg z-10"
        onClick={handleFindNearestPC}
      >
        <LocateFixed className="h-6 w-6" />
      </Button>
    </>
  );
}
