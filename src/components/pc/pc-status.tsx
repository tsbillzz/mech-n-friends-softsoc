import type { PC } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PCWithFiltered = PC & { status: 'available' | 'occupied' | 'filtered' };

type PCStatusProps = {
  pc: PCWithFiltered;
};

const statusClasses = {
  available: 'bg-emerald-500',
  occupied: 'bg-rose-500',
  filtered: 'bg-gray-400',
}

export default function PCStatus({ pc }: PCStatusProps) {
  const tooltipContent = pc.status === 'filtered' 
    ? `${pc.id}: Does not match filter`
    : `${pc.id}: ${pc.status}`;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute w-4 h-4 rounded-sm border-2 border-white/50 shadow-md transition-all duration-300 transform hover:scale-125',
              statusClasses[pc.status]
            )}
            style={{ top: pc.position.top, left: pc.position.left }}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
          {pc.software.length > 0 && (
             <p className="text-xs text-muted-foreground">
               Software: {pc.software.join(', ')}
             </p>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
