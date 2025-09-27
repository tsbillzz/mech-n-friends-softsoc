import type { PC } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '../ui/button';
import { Triangle, Wrench, Monitor } from 'lucide-react';

type PCWithFiltered = PC & { status: 'available' | 'occupied' | 'filtered' | 'broken' | 'under maintenance' };

type PCStatusProps = {
  pc: PCWithFiltered;
  onToggleBrokenStatus: (pcId: string) => void;
  onToggleMaintenanceStatus: (pcId: string) => void;
};

const statusClasses = {
  available: 'text-emerald-500',
  occupied: 'text-rose-500',
  filtered: 'text-gray-400',
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

  const Icon = isBroken ? Triangle : isMaintenance ? Wrench : Monitor;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'relative flex flex-col items-center justify-center aspect-square transition-all duration-300 transform hover:scale-110 cursor-pointer p-1 rounded-md border-2',
              pc.status === 'available' && 'border-emerald-500/50 bg-emerald-500/10',
              pc.status === 'occupied' && 'border-rose-500/50 bg-rose-500/10',
              pc.status === 'filtered' && 'border-gray-400/50 bg-gray-400/10',
              pc.status === 'broken' && 'border-yellow-500/50 bg-yellow-500/10',
              pc.status === 'under maintenance' && 'border-blue-500/50 bg-blue-500/10',
            )}
          >
            <Icon className={cn('w-6 h-6 mb-1', statusClasses[pc.status], isBroken && 'fill-current')} />
            <span className="text-xs font-mono truncate">{pc.id.split('-').pop()}</span>
          </div>
        </TooltipTrigger>
        <TooltipContent className="flex flex-col gap-2 items-center">
          <p>{tooltipContent}</p>
          {pc.software.length > 0 && (
             <p className="text-xs text-muted-foreground max-w-xs text-center">
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
