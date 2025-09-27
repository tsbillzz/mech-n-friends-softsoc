"use client";

import type { Building } from '@/lib/data';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import NearestPcFinder from './nearest-pc-finder';
import QuietSpots from './quiet-spots';

type SuggestionWidgetsProps = {
  buildings: Building[];
  onSelectBuilding: (buildingId: string) => void;
};

export default function SuggestionWidgets({ buildings, onSelectBuilding }: SuggestionWidgetsProps) {
  return (
    <Accordion type="multiple" defaultValue={['item-1']} className="w-full space-y-4">
      <AccordionItem value="item-1" className="border-none">
        <AccordionContent className="p-0">
           <NearestPcFinder buildings={buildings} onSelectBuilding={onSelectBuilding} />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border-none">
        <AccordionContent className="p-0">
          <QuietSpots buildings={buildings} onSelectBuilding={onSelectBuilding}/>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
