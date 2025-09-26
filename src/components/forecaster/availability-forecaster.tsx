'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { getForecast } from '@/app/actions';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Lightbulb, Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const daysOfWeek = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
];

const timesOfDay = [
  '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM'
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
      Predict Availability
    </Button>
  );
}

export default function AvailabilityForecaster({ buildingName }: { buildingName: string }) {
  const initialState = { message: '', errors: {} };
  const [state, dispatch] = useFormState(getForecast, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.message === 'An error occurred.' || state.message === "Failed to get forecast.") {
      toast({
        variant: "destructive",
        title: "Prediction Error",
        description: state.errors?._form?.[0] || "An unexpected error occurred.",
      })
    }
  }, [state, toast]);


  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-2xl">AI Availability Forecaster</CardTitle>
        <CardDescription>Predict PC availability for a future time.</CardDescription>
      </CardHeader>
      <form action={dispatch}>
        <CardContent className="space-y-4">
          <Input type="hidden" name="building" value={buildingName} />
          <div>
            <Label htmlFor="day">Day of the Week</Label>
            <Select name="day" defaultValue="Monday">
              <SelectTrigger id="day">
                <SelectValue placeholder="Select a day" />
              </SelectTrigger>
              <SelectContent>
                {daysOfWeek.map(day => (
                  <SelectItem key={day} value={day}>{day}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="time">Time</Label>
            <Select name="time" defaultValue="12:00 PM">
              <SelectTrigger id="time">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent>
                {timesOfDay.map(time => (
                  <SelectItem key={time} value={time}>{time}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-start gap-4">
          <SubmitButton />
          {state.forecast && (
            <div className="w-full p-4 bg-primary/10 rounded-md border border-primary/20">
              <p className="font-semibold text-primary text-center">{state.forecast}</p>
            </div>
          )}
        </CardFooter>
      </form>
    </Card>
  );
}
