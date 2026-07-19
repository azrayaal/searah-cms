import { cn } from '@/lib/cn';
import type { ContentStatus } from '@/types/api';

type Tone = 'neutral' | 'primary' | 'accent' | 'sage' | 'success' | 'warning' | 'danger';

/**
 * Wash ground + saturated text + an inset ring of the same hue, so a badge reads as
 * one coloured object rather than tinted text that happens to sit on a tinted box.
 *
 * Two contrast notes, both load-bearing:
 *
 * - `warning` sets its text in gray-900, not orange. The orange ramp tops out at
 *   3.16:1 on white and 2.9:1 on its own wash, and badge text is 14px — nowhere near
 *   large enough for the 3:1 exemption. The amber ground carries the meaning; the
 *   text just has to be readable.
 * - `success` grounds at 70% so the wash blends toward white. At full strength the
 *   green text lands on 4.43:1, a hair under AA; lightening the ground clears it.
 */
const TONES: Record<Tone, string> = {
  neutral: 'bg-gray-100 text-gray-700 ring-1 ring-inset ring-gray-300',
  primary: 'bg-primary-100 text-primary ring-1 ring-inset ring-primary-200',
  accent: 'bg-warning-100 text-gray-900 ring-1 ring-inset ring-orange-200',
  sage: 'bg-sage-100 text-gray-700 ring-1 ring-inset ring-sage/50',
  success: 'bg-success-100/70 text-success ring-1 ring-inset ring-success/30',
  warning: 'bg-warning-100 text-gray-900 ring-1 ring-inset ring-orange-200',
  danger: 'bg-danger-100 text-danger ring-1 ring-inset ring-danger/25',
};

/** The dot is the fill-only use of a hue that is too light to set text in. */
const DOT_TONES: Record<Tone, string> = {
  neutral: 'bg-gray-500',
  primary: 'bg-primary-500',
  accent: 'bg-orange',
  sage: 'bg-sage',
  success: 'bg-success',
  warning: 'bg-orange',
  danger: 'bg-danger',
};

export interface BadgeProps {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  /** Leading status dot. Adds a second, non-colour-dependent cue to the tone. */
  dot?: boolean;
}

export function Badge({ children, tone = 'neutral', className, dot = false }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-caption font-semibold uppercase tracking-wide',
        TONES[tone],
        className,
      )}
    >
      {dot && <span aria-hidden="true" className={cn('h-1.5 w-1.5 shrink-0 rounded-full', DOT_TONES[tone])} />}
      {children}
    </span>
  );
}

/**
 * Publish state gets three genuinely different hues rather than three greys: live is
 * green, unfinished is amber, retired is the cool sage. Sage rather than plain grey
 * for ARCHIVED so it still reads as a deliberate state and not as a missing value.
 *
 * None of them is burgundy — an archived article is not an error.
 */
const STATUS_TONE: Record<ContentStatus, Tone> = {
  PUBLISHED: 'success',
  DRAFT: 'warning',
  ARCHIVED: 'sage',
};

const STATUS_LABEL: Record<ContentStatus, string> = {
  PUBLISHED: 'Published',
  DRAFT: 'Draft',
  ARCHIVED: 'Archived',
};

/** Publish state, rendered consistently everywhere it appears. */
export function StatusBadge({ status }: { status: ContentStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} dot>
      {STATUS_LABEL[status]}
    </Badge>
  );
}
