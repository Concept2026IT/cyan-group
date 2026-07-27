import { clsx, type ClassValue } from "clsx";

/** Conditional class joining. Pairs with cva variants on every component. */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}
