'use client';

import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import type { Building } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type CampusMapProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
};

const BuildingShape = ({ building, onSelect }: { building: Building; onSelect: () => void; }) => {
  return (
    <div
      className="absolute group"
      style={{
        top: building.position.top,
        left: building.position.left,
        width: building.dimensions?.width || '120px',
        height: building.dimensions?.height || '80px',
      }}
    >
      <button
        onClick={onSelect}
        className={cn(
          "w-full h-full bg-primary/20 border-2 border-primary/50 rounded-md transition-all duration-300 group-hover:bg-primary/40 group-hover:border-primary group-hover:scale-105",
          building.className
        )}
        title={`View ${building.name}`}
      />
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-primary-foreground font-bold text-center text-sm drop-shadow-md pointer-events-none group-hover:text-white">
        {building.name}
      </span>
    </div>
  );
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
            <BuildingShape
              key={building.id}
              building={building}
              onSelect={() => onSelectBuilding(building.id)}
            />
          ))}
        </div>
        <div className="mt-4 text-center">
            <p className="text-muted-foreground">Click on a building to see PC availability.</p>
        </div>
      </CardContent>
    </Card>
  );
}
