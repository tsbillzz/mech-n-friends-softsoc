"use server";

import { predictPcAvailability } from "@/ai/flows/pc-availability-forecast";
import { z } from "zod";

const formSchema = z.object({
  building: z.string().min(1, "Building is required."),
  day: z.string().min(1, "Day is required."),
  time: z.string().min(1, "Time is required."),
});

export type FormState = {
  message: string;
  forecast?: string;
  errors?: {
    building?: string[];
    day?: string[];
    time?: string[];
    _form?: string[];
  }
};

export async function getForecast(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const validatedFields = formSchema.safeParse({
    building: formData.get("building"),
    day: formData.get("day"),
    time: formData.get("time"),
  });

  if (!validatedFields.success) {
    return {
      message: "Validation failed.",
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { building, day, time } = validatedFields.data;
  const fullTime = `${day} ${time}`;

  try {
    const result = await predictPcAvailability({ building, time: fullTime });
    if (result.availabilityForecast) {
      return { message: "Success", forecast: result.availabilityForecast };
    } else {
      return { message: "Failed to get forecast.", errors: { _form: ["The AI model did not return a forecast. Please try again."] } };
    }
  } catch (error) {
    console.error("AI Forecast Error:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred while contacting the AI model.";
    return { message: "An error occurred.", errors: { _form: [errorMessage] } };
  }
}
