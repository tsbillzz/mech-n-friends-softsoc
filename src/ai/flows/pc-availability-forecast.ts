'use server';

/**
 * @fileOverview This file defines a Genkit flow for predicting PC availability based on historical data.
 *
 * It includes:
 * - `predictPcAvailability`: A function that takes building and time as input and returns a prediction of PC availability.
 * - `PredictPcAvailabilityInput`: The input type for the `predictPcAvailability` function.
 * - `PredictPcAvailabilityOutput`: The output type for the `predictPcAvailability` function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PredictPcAvailabilityInputSchema = z.object({
  building: z.string().describe('The name of the building to predict PC availability for.'),
  time: z.string().describe('The time of day to predict PC availability for (e.g., "Monday 9:00 AM").'),
});
export type PredictPcAvailabilityInput = z.infer<typeof PredictPcAvailabilityInputSchema>;

const PredictPcAvailabilityOutputSchema = z.object({
  availabilityForecast: z.string().describe('A prediction of PC availability at the given time in the given building.'),
});
export type PredictPcAvailabilityOutput = z.infer<typeof PredictPcAvailabilityOutputSchema>;

export async function predictPcAvailability(input: PredictPcAvailabilityInput): Promise<PredictPcAvailabilityOutput> {
  return predictPcAvailabilityFlow(input);
}

const prompt = ai.definePrompt({
  name: 'pcAvailabilityForecastPrompt',
  input: {schema: PredictPcAvailabilityInputSchema},
  output: {schema: PredictPcAvailabilityOutputSchema},
  prompt: `You are a university resource planning assistant.  Based on historical data,
  predict the PC availability at the University of Sydney in the following building at the following time:

  Building: {{{building}}}
  Time: {{{time}}}

  Respond with a short sentence.`,
});

const predictPcAvailabilityFlow = ai.defineFlow(
  {
    name: 'predictPcAvailabilityFlow',
    inputSchema: PredictPcAvailabilityInputSchema,
    outputSchema: PredictPcAvailabilityOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
