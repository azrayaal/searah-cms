import { useEffect, useRef, type ReactNode } from 'react';

import { X } from 'lucide-react';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  /** Widen for grid content such as the media picker. */
  size?: 'md' | 'lg';
}

/**
 * A dialog built on the native `<dialog>` element.
 *
 * Using the platform element rather than a div-with-a-backdrop buys focus trapping,
 * inertness of the page behind, Escape-to-close and top-layer stacking for free —
 * all of which are laborious and easy to get subtly wrong by hand.
 *
 * `showModal()` throws if called on an already-open dialog, so both calls are guarded
 * by the element's own `open` property rather than by React state alone.
 */
export function Modal({ open, onClose, title, description, children, footer, size = 'md' }: ModalProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;

    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      // Escape and backdrop dismissal both route through the same handler, so the
      // parent's state can never disagree with what is on screen.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`w-full rounded-card p-0 backdrop:bg-gray-900/50 ${
        size === 'lg' ? 'max-w-4xl' : 'max-w-lg'
      }`}
      aria-label={title}
    >
      <div className="flex max-h-[85vh] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 px-6 py-4">
          <div>
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-3 border-t border-gray-200 px-6 py-4">{footer}</div>
        )}
      </div>
    </dialog>
  );
}
