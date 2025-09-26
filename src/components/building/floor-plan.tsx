import Image from 'next/image';
import type { PC } from '@/lib/data';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import PCStatus from '../pc/pc-status';
import { Card, CardContent } from '@/components/ui/card';

type FloorPlanProps = {
  originalPcs: PC[];
  filteredPcs: PC[];
  floorImageId: string;
  isFiltered: boolean;
};

export default function FloorPlan({ originalPcs, filteredPcs, floorImageId, isFiltered }: FloorPlanProps) {
  const floorImage = PlaceHolderImages.find((img) => img.id === floorImageId);

  const filteredPcIds = new Set(filteredPcs.map(p => p.id));

  const pcsToDisplay = isFiltered 
    ? originalPcs.map(pc => ({
        ...pc,
        status: pc.status === 'occupied' 
          ? 'occupied' 
          : (filteredPcIds.has(pc.id) ? 'available' : 'filtered'),
      }))
    : originalPcs;

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
          {pcsToDisplay.map((pc) => (
            <PCStatus key={pc.id} pc={pc} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
