'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Building } from '@/lib/data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin } from 'lucide-react';

type CampusMapProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
};

export default function CampusMap({ buildings, onSelectBuilding }: CampusMapProps) {
  const mapImage = PlaceHolderImages.find((img) => img.id === 'campus-map');

  return (
    <Card className="overflow-hidden shadow-xl">
      <CardHeader>
        <CardTitle className="font-headline text-3xl">Campus Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative w-full aspect-[3/2] rounded-lg overflow-hidden border">
          {mapImage && (
            <Image
              src={mapImage.imageUrl}
              alt={mapImage.description}
              fill
              className="object-cover"
              data-ai-hint={mapImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-black/10" />
          {buildings.map((building) => (
            <Button
              key={building.id}
              variant="secondary"
              className="absolute transform -translate-x-1/2 -translate-y-1/2 rounded-full h-auto p-2 shadow-lg animate-pulse"
              style={{ top: building.position.top, left: building.position.left }}
              onClick={() => onSelectBuilding(building.id)}
              title={`View ${building.name}`}
            >
              <MapPin className="w-6 h-6 text-primary" />
              <span className="sr-only">{building.name}</span>
            </Button>
          ))}
        </div>
        <div className="mt-4 text-center">
            <p className="text-muted-foreground">Click on a map pin to see PC availability in a building.</p>
        </div>
      </CardContent>
    </Card>
  );
}
