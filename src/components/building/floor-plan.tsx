import Image from 'next/image';
import type { Floor } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PCStatus from '../pc/pc-status';
import { Card, CardContent } from '@/components/ui/card';

type FloorPlanProps = {
  floor: Floor;
};

export default function FloorPlan({ floor }: FloorPlanProps) {
  const floorImage = PlaceHolderImages.find((img) => img.id === floor.mapImageId);

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <div className="relative w-full aspect-[5/3] rounded-md overflow-hidden bg-muted">
          {floorImage && (
            <Image
              src={floorImage.imageUrl}
              alt={floorImage.description}
              fill
              className="object-cover"
              data-ai-hint={floorImage.imageHint}
            />
          )}
          {floor.pcs.map((pc) => (
            <PCStatus key={pc.id} pc={pc} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
