import { useMemo } from 'react';
import type { PC } from '@/lib/data';
import Image from 'next/image';
import PCStatus from '../pc/pc-status';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FloorPlanProps = {
  originalPcs: PC[];
  filteredPcs: PC[];
  isFiltered: boolean;
  onToggleBrokenStatus: (pcId: string) => void;
  onToggleMaintenanceStatus: (pcId: string) => void;
  mapImage: string;
};

const ClusterHighlight = ({ pcs }: { pcs: PC[] }) => {
  if (pcs.length < 2) return null;

  const tops = pcs.map(p => parseFloat(p.position.top));
  const lefts = pcs.map(p => parseFloat(p.position.left));

  const minTop = Math.min(...tops);
  const maxTop = Math.max(...tops);
  const minLeft = Math.min(...lefts);
  const maxLeft = Math.max(...lefts);

  const style = {
    top: `${minTop - 2}%`,
    left: `${minLeft - 2}%`,
    width: `${maxLeft - minLeft + 6}%`,
    height: `${maxTop - minTop + 6}%`,
  };

  return (
    <div
      className="absolute bg-purple-500/20 border-2 border-purple-500/50 rounded-lg animate-pulse"
      style={style}
    />
  );
};

export default function FloorPlan({ originalPcs, filteredPcs, isFiltered, onToggleBrokenStatus, onToggleMaintenanceStatus, mapImage }: FloorPlanProps) {
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

  const availableClusters = useMemo(() => {
    const clusters: { [key: number]: PC[] } = {};
    const availablePcs = pcsToDisplay.filter(p => p.status === 'available' && p.clusterId);

    for (const pc of availablePcs) {
      if (pc.clusterId) {
        if (!clusters[pc.clusterId]) {
          clusters[pc.clusterId] = [];
        }
        clusters[pc.clusterId].push(pc);
      }
    }

    const allPcsByCluster: { [key: number]: PC[] } = {};
    for (const pc of originalPcs) {
      if (pc.clusterId) {
        if (!allPcsByCluster[pc.clusterId]) {
          allPcsByCluster[pc.clusterId] = [];
        }
        allPcsByCluster[pc.clusterId].push(pc);
      }
    }

    return Object.values(clusters).filter(cluster => {
      const originalCluster = allPcsByCluster[cluster[0].clusterId!];
      return cluster.length === originalCluster.length;
    });
  }, [pcsToDisplay, originalPcs]);
  
  return (
    <Card className="shadow-lg">
      <CardContent className="p-4">
        <div className="relative w-full aspect-[5/3] rounded-md overflow-hidden bg-muted">
          <Image 
            src={mapImage} 
            alt="Floor plan" 
            fill
            className="object-contain"
            sizes="100vw"
          />
          {availableClusters.map((cluster, index) => (
            <ClusterHighlight key={index} pcs={cluster} />
          ))}
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
