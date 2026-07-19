import { forwardRef, useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from 'react';

import { cn } from '@/lib/cn';

/* -------------------------------------------------------------------- Shell */

interface FieldShellProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  children: ReactNode;
  className?: string;
}

/**
 * Label + control + message, wired together for assistive technology.
 *
 * The error is rendered in a `role="alert"` region and referenced by the control's
 * `aria-describedby`, so a screen reader announces *why* a field was rejected rather
 * than leaving the user to infer it from a red border they cannot see.
 */
function FieldShell({ label, hint, error, required, htmlFor, children, className }: FieldShellProps) {
  const describedBy = [error ? `${htmlFor}-error` : null, hint && !error ? `${htmlFor}-hint` : null]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && (
        <label htmlFor={htmlFor} className="text-sm font-semibold text-gray-700">
          {label}
          {required && (
            <span className="ml-1 text-burgundy" aria-hidden="true">
              *
            </span>
          )}
          {required && <span className="sr-only">(required)</span>}
        </label>
      )}

      <div data-described-by={describedBy || undefined}>{children}</div>

      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="text-sm text-burgundy">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${htmlFor}-hint`} className="text-sm text-gray-700">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

/**
 * Focus is a navy border plus the shared `shadow-focus` ring, so a focused field
 * matches every other focused control in the app rather than inventing its own.
 */
const CONTROL_BASE =
  'w-full rounded-field border bg-white px-3.5 text-body text-gray-900 placeholder:text-gray-500 ' +
  'transition-colors duration-150 ease-premium focus:outline-none focus:shadow-focus ' +
  'disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-500';

function controlClasses(hasError: boolean, extra?: string): string {
  return cn(
    CONTROL_BASE,
    hasError
      ? 'border-burgundy focus:border-burgundy'
      : 'border-gray-300 hover:border-primary-300 focus:border-primary',
    extra,
  );
}

/* -------------------------------------------------------------------- Input */

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, hint, error, required, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={fieldId} className={className}>
      <input
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={controlClasses(Boolean(error), 'h-11')}
        {...props}
      />
    </FieldShell>
  );
});

/* ----------------------------------------------------------------- Textarea */

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  hint?: string;
  error?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hint, error, required, className, id, rows = 4, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={fieldId} className={className}>
      <textarea
        ref={ref}
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={controlClasses(Boolean(error), 'py-2.5 resize-y min-h-[96px]')}
        {...props}
      />
    </FieldShell>
  );
});

/* ------------------------------------------------------------------- Select */

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hint?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, hint, error, required, className, id, options, placeholder, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <FieldShell label={label} hint={hint} error={error} required={required} htmlFor={fieldId} className={className}>
      <select
        ref={ref}
        id={fieldId}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
        className={controlClasses(Boolean(error), 'h-11 pr-9')}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
});

/* ------------------------------------------------------------------ Checkbox */

export interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string;
  hint?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, hint, className, id, ...props },
  ref,
) {
  const generatedId = useId();
  const fieldId = id ?? generatedId;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <input
        ref={ref}
        id={fieldId}
        type="checkbox"
        className="mt-0.5 h-[18px] w-[18px] shrink-0 rounded border-gray-300 text-primary
                   focus:ring-2 focus:ring-primary/25 focus:ring-offset-0"
        {...props}
      />
      <div className="flex flex-col">
        <label htmlFor={fieldId} className="text-sm font-medium text-gray-900">
          {label}
        </label>
        {hint && <span className="text-sm text-gray-700">{hint}</span>}
      </div>
    </div>
  );
});
