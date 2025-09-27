import type { PC } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '../ui/button';
import { Triangle, Wrench } from 'lucide-react';

type PCWithFiltered = PC & { status: 'available' | 'occupied' | 'filtered' | 'broken' | 'under maintenance' };

type PCStatusProps = {
  pc: PCWithFiltered;
  onToggleBrokenStatus: (pcId: string) => void;
  onToggleMaintenanceStatus: (pcId: string) => void;
};

const statusClasses = {
  available: 'bg-emerald-500',
  occupied: 'bg-rose-500',
  filtered: 'bg-gray-400',
  broken: 'text-yellow-500',
  'under maintenance': 'text-blue-500',
}

export default function PCStatus({ pc, onToggleBrokenStatus, onToggleMaintenanceStatus }: PCStatusProps) {
  const isBroken = pc.status === 'broken';
  const isMaintenance = pc.status === 'under maintenance';
  
  const tooltipContent = 
    isBroken ? `${pc.id}: Broken` :
    isMaintenance ? `${pc.id}: Under Maintenance` :
    pc.status === 'filtered' ? `${pc.id}: Does not match filter` :
    `${pc.id}: ${pc.status}`;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute w-4 h-4 transition-all duration-300 transform hover:scale-125',
              !isBroken && !isMaintenance && 'rounded-sm border-2 border-white/50 shadow-md',
              statusClasses[pc.status]
            )}
            style={{ top: pc.position.top, left: pc.position.left }}
          >
            {isBroken && <Triangle className="w-full h-full fill-current" />}
            {isMaintenance && <Wrench className="w-full h-full" />}
          </div>
        </TooltipTrigger>
        <TooltipContent className="flex flex-col gap-2 items-center">
          <p>{tooltipContent}</p>
          {pc.software.length > 0 && (
             <p className="text-xs text-muted-foreground">
               Software: {pc.software.join(', ')}
             </p>
          )}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleBrokenStatus(pc.id);
              }}
            >
              <Triangle className="mr-2" />
              {isBroken ? 'Mark as Fixed' : 'Flag as Broken'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMaintenanceStatus(pc.id);
              }}
            >
              <Wrench className="mr-2" />
              {isMaintenance ? 'End Maintenance' : 'Start Maintenance'}
            </Button>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
