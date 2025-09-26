import type { PC } from '@/lib/data';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

type PCStatusProps = {
  pc: PC;
};

export default function PCStatus({ pc }: PCStatusProps) {
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={cn(
              'absolute w-4 h-4 rounded-sm border-2 border-white/50 shadow-md transition-all duration-300 transform hover:scale-125',
              pc.status === 'available' ? 'bg-emerald-500' : 'bg-rose-500'
            )}
            style={{ top: pc.position.top, left: pc.position.left }}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>{pc.id}: {pc.status}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
