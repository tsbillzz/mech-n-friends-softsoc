"use client";

import { allSoftware } from '@/lib/data';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { SlidersHorizontal } from 'lucide-react';

type SoftwareFilterProps = {
  selectedSoftware: string[];
  onSoftwareChange: (software: string) => void;
};

export default function SoftwareFilter({ selectedSoftware, onSoftwareChange }: SoftwareFilterProps) {
  return (
    <Card className="shadow-lg animate-in fade-in-50 duration-500">
      <CardHeader>
        <CardTitle className="font-headline text-2xl flex items-center gap-2">
          <SlidersHorizontal />
          Software Filter
        </CardTitle>
        <CardDescription>Find a PC with the software you need.</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-4 max-h-64 overflow-y-auto">
        {allSoftware.map(software => (
          <div key={software} className="flex items-center space-x-2">
            <Checkbox
              id={`filter-${software}`}
              checked={selectedSoftware.includes(software)}
              onCheckedChange={() => onSoftwareChange(software)}
            />
            <Label htmlFor={`filter-${software}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
              {software}
            </Label>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
