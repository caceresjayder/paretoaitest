import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { ZodError } from "zod";
import { v4 as uuidv4 } from "uuid";


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function parseZodErrors(errors: ZodError) {
  const errorMap: Record<string, string> = {};
  const fieldErrors = errors.flatten().fieldErrors;
  for(const [key, value] of Object.entries(fieldErrors)) {
      errorMap[key] = value?.[0] ?? '';
  }
  return errorMap;
}


export function generateUniqueUUID() {
  return uuidv4();
}