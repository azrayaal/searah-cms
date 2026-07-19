import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merges class names, resolving Tailwind conflicts in favour of the last value.
 * Without twMerge, a `className` prop passed to a component cannot reliably
 * override the component's own utilities — both end up in the class list and the
 * winner is decided by stylesheet order.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
