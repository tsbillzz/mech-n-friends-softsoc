import type { PC } from '@/lib/data';
import PCStatus from '../pc/pc-status';
import { Card, CardContent } from '@/components/ui/card';

type FloorPlanProps = {
  originalPcs: PC[];
  filteredPcs: PC[];
  isFiltered: boolean;
  onToggleBrokenStatus: (pcId: string) => void;
  onToggleMaintenanceStatus: (pcId: string) => void;
};

export default function FloorPlan({ originalPcs, filteredPcs, isFiltered, onToggleBrokenStatus, onToggleMaintenanceStatus }: FloorPlanProps) {
  const filteredPcIds = new Set(filteredPcs.map(p => p.id));

  const pcsToDisplay = isFiltered 
    ? originalPcs.map(pc => ({
        ...pc,
        status: pc.status === 'broken'
          ? 'broken'
          : pc.status === 'under maintenance'
          ? 'under maintenance'
          : pc.status === 'occupied' 
          ? 'occupied' 
          : (filteredPcIds.has(pc.id) ? 'available' : 'filtered'),
      }))
    : originalPcs;

  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <div className="relative w-full aspect-[5/3] rounded-md overflow-hidden bg-muted">
          {pcsToDisplay.map((pc) => (
            <PCStatus 
              key={pc.id} 
              pc={pc} 
              onToggleBrokenStatus={onToggleBrokenStatus}
              onToggleMaintenanceStatus={onToggleMaintenanceStatus}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
