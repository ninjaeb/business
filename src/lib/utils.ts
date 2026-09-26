import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Appends a one-shot `?flash=<message>` param — read once by FlashToast on
// the destination page — for a redirect()-on-success action, where there's
// no mounted component left to show a toast directly.
export function withFlash(path: string, message: string) {
  const separator = path.includes("?") ? "&" : "?";
  return `${path}${separator}flash=${encodeURIComponent(message)}`;
}
