import type { PC } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Button } from '../ui/button';
import { AlertTriangle, Triangle } from 'lucide-react';

type PCWithFiltered = PC & { status: 'available' | 'occupied' | 'filtered' | 'broken' };

type PCStatusProps = {
  pc: PCWithFiltered;
  onToggleBrokenStatus: (pcId: string) => void;
};

const statusClasses = {
  available: 'bg-emerald-500',
  occupied: 'bg-rose-500',
  filtered: 'bg-gray-400',
  broken: 'text-yellow-500',
}

export default function PCStatus({ pc, onToggleBrokenStatus }: PCStatusProps) {
  const isBroken = pc.status === 'broken';
  
  const tooltipContent = isBroken
    ? `${pc.id}: Broken`
    : pc.status === 'filtered'
    ? `${pc.id}: Does not match filter`
    : `${pc.id}: ${pc.status}`;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute w-4 h-4 transition-all duration-300 transform hover:scale-125',
              !isBroken && 'rounded-sm border-2 border-white/50 shadow-md',
              statusClasses[pc.status]
            )}
            style={{ top: pc.position.top, left: pc.position.left }}
          >
            {isBroken && <Triangle className="w-full h-full fill-current" />}
          </div>
        </TooltipTrigger>
        <TooltipContent className="flex flex-col gap-2 items-center">
          <p>{tooltipContent}</p>
          {pc.software.length > 0 && (
             <p className="text-xs text-muted-foreground">
               Software: {pc.software.join(', ')}
             </p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="h-8"
            onClick={(e) => {
              e.stopPropagation();
              onToggleBrokenStatus(pc.id);
            }}
          >
            <AlertTriangle className="mr-2" />
            {isBroken ? 'Mark as Fixed' : 'Flag as Broken'}
          </Button>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
