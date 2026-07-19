import type { HTMLAttributes, ReactNode } from 'react';

import { cn } from '@/lib/cn';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Removes the default 24px padding, for cards wrapping a full-bleed table. */
  flush?: boolean;
}

/**
 * White surface, 16px radius, 24px padding — the design system card.
 *
 * Definition comes from the border; the shadow is only there to lift the card a
 * hair off the pale-blue page ground, which is why it is barely visible.
 */
export function Card({ flush = false, className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'animate-fade-in rounded-card border border-gray-300/60 bg-white shadow-card',
        !flush && 'p-6',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface CardHeaderProps {
  title: string;
  description?: string;
  /** Actions rendered on the trailing edge — buttons, filters, menus. */
  actions?: ReactNode;
  className?: string;
}

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cn('flex flex-wrap items-start justify-between gap-4', className)}>
      <div className="min-w-0">
        <h2 className="text-h4 text-gray-900">{title}</h2>
        {description && <p className="mt-1 text-sm text-gray-700">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
    </div>
  );
}

export type StatCardTone = 'primary' | 'accent' | 'sage' | 'success';

export interface StatCardProps {
  label: string;
  value: string | number;
  caption?: string;
  icon?: ReactNode;
  /**
   * Which category the figure belongs to. Purely a wayfinding cue — a dashboard of
   * identical navy tiles is unreadable at a glance, four hues are not.
   *
   * Deliberately excludes burgundy: burgundy means "something is wrong", and a count
   * of production readings is not an error.
   */
  tone?: StatCardTone;
}

/**
 * Icon chips are a saturated fill with a white glyph rather than a pale wash with a
 * coloured glyph. The orange ramp forced the choice — orange on any tint of itself
 * cannot clear the 3:1 that a meaningful icon needs — and once one tone is solid,
 * all four are, so the row reads as one set.
 *
 * Each pairing below clears 3:1 against white: primary 10.2, success 5.1, sage 4.0,
 * accent 3.2.
 */
const CHIP_TONES: Record<StatCardTone, string> = {
  primary: 'bg-primary text-white',
  accent: 'bg-orange-700 text-white',
  sage: 'bg-sage-700 text-white',
  success: 'bg-success text-white',
};

/** The hairline that picks up the chip colour, so the tint reaches the card edge. */
const EDGE_TONES: Record<StatCardTone, string> = {
  primary: 'border-primary-200',
  accent: 'border-orange-200',
  sage: 'border-sage/40',
  success: 'border-success/25',
};

export function StatCard({ label, value, caption, icon, tone = 'primary' }: StatCardProps) {
  return (
    <Card
      className={cn(
        'flex items-start justify-between gap-4 transition-shadow duration-200 ease-premium hover:shadow-dropdown',
        EDGE_TONES[tone],
      )}
    >
      <div className="min-w-0">
        <p className="text-label uppercase text-gray-700">{label}</p>
        {/* tabular-nums keeps figures from shifting width as they animate or update. */}
        <p className="mt-2 text-h2 tabular-nums text-gray-900">{value}</p>
        {caption && <p className="mt-1 text-sm text-gray-700">{caption}</p>}
      </div>
      {icon && (
        <span
          aria-hidden="true"
          className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-field', CHIP_TONES[tone])}
        >
          {icon}
        </span>
      )}
    </Card>
  );
}
