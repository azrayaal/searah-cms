import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';

import { Loader2 } from 'lucide-react';

import { cn } from '@/lib/cn';

type Variant = 'primary' | 'secondary' | 'orange' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/**
 * `orange` sets its label in gray-900, not white. White on #F7921E is 2.31:1 — the
 * orange is a fill colour precisely because nothing light survives on it — whereas
 * near-black lands on 9.1:1, and 6.6:1 against the darker hover. The button still
 * reads as the warm one; the label is simply the dark half of the pair.
 *
 * `secondary` picks up a navy tint on hover rather than a grey one, so the whole
 * control set resolves toward the brand instead of toward grey.
 */
const VARIANTS: Record<Variant, string> = {
  primary: 'bg-primary text-white hover:bg-primary-700 active:bg-primary-900 shadow-card',
  secondary:
    'bg-white text-primary border border-primary-200 hover:bg-primary-100 hover:border-primary-300 active:bg-primary-100',
  orange: 'bg-orange text-gray-900 hover:bg-orange-700 active:bg-orange-700 shadow-card',
  ghost: 'bg-transparent text-gray-700 hover:bg-primary-100 hover:text-primary active:bg-primary-100',
  danger: 'bg-burgundy text-white hover:bg-burgundy-700 active:bg-burgundy-700',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm gap-1.5',
  md: 'h-11 px-5 text-[15px] gap-2',
  lg: 'h-12 px-6 text-base gap-2',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  leadingIcon?: ReactNode;
  trailingIcon?: ReactNode;
  fullWidth?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    className,
    children,
    disabled,
    type = 'button',
    ...props
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      // Disabled while loading, so a double-click cannot fire the mutation twice.
      disabled={disabled || isLoading}
      // Announces the pending state to screen readers, which cannot see the spinner.
      aria-busy={isLoading || undefined}
      className={cn(
        'inline-flex items-center justify-center rounded-btn font-semibold',
        'transition-colors duration-150 ease-premium',
        'disabled:cursor-not-allowed disabled:opacity-55',
        VARIANTS[variant],
        SIZES[size],
        fullWidth && 'w-full',
        className,
      )}
      {...props}
    >
      {isLoading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : leadingIcon}
      {children}
      {!isLoading && trailingIcon}
    </button>
  );
});
