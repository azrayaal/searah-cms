import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';

import { MediaField } from '@/components/media/MediaPicker';
import { Button } from '@/components/ui/Button';
import { Input, Textarea } from '@/components/ui/Field';
import type { ContentBlock, MediaRef } from '@/types/api';

/**
 * The article body editor.
 *
 * The API stores the body as a validated discriminated union, not HTML, so this is a
 * block editor rather than a rich-text box: each block is one of six known shapes and
 * the server rejects anything else. That constraint is the point — the landing page
 * renders each type with its own component, so a free-form HTML field would either
 * lose that mapping or smuggle arbitrary markup past the sanitiser.
 *
 * Order is positional, matching the array the API stores, so moving a block is an
 * array swap and needs no sort column.
 */

const BLOCK_LABELS: Record<ContentBlock['type'], string> = {
  paragraph: 'Paragraph',
  heading: 'Heading',
  quote: 'Quote',
  list: 'List',
  image: 'Image',
  stat: 'Statistics',
};

const EMPTY_MEDIA: MediaRef = { src: '', alt: '' };

function blankBlock(type: ContentBlock['type']): ContentBlock {
  switch (type) {
    case 'heading':
      return { type: 'heading', text: '' };
    case 'quote':
      return { type: 'quote', text: '', attribution: '' };
    case 'list':
      return { type: 'list', items: [''] };
    case 'image':
      return { type: 'image', media: { ...EMPTY_MEDIA } };
    case 'stat':
      return { type: 'stat', items: [{ label: '', value: '' }] };
    default:
      return { type: 'paragraph', text: '' };
  }
}

export interface BlockEditorProps {
  value: ContentBlock[];
  onChange: (blocks: ContentBlock[]) => void;
}

export function BlockEditor({ value, onChange }: BlockEditorProps) {
  const replace = (index: number, block: ContentBlock) => {
    onChange(value.map((existing, position) => (position === index ? block : existing)));
  };

  const remove = (index: number) => {
    onChange(value.filter((_, position) => position !== index));
  };

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= value.length) return;

    const next = [...value];
    const [moved] = next.splice(index, 1);
    if (moved) next.splice(target, 0, moved);
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4">
      {value.length === 0 && (
        <p className="rounded-card border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
          No body content yet. Add a block to begin.
        </p>
      )}

      {value.map((block, index) => (
        // Keyed by position: blocks carry no id, and a content-derived key would
        // remount the field — losing focus — on every keystroke.
        <div key={index} className="rounded-card border border-gray-200">
          <div className="flex items-center justify-between gap-2 border-b border-gray-200 bg-surface-page px-4 py-2">
            <span className="text-sm font-semibold text-gray-700">
              {index + 1}. {BLOCK_LABELS[block.type]}
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label="Move up"
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <ChevronUp className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label="Move down"
                disabled={index === value.length - 1}
                onClick={() => move(index, 1)}
              >
                <ChevronDown className="h-4 w-4" aria-hidden="true" />
              </Button>

              <Button
                type="button"
                size="sm"
                variant="ghost"
                aria-label={`Remove block ${index + 1}`}
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4 text-burgundy" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="flex flex-col gap-4 p-4">
            <BlockFields block={block} onChange={(next) => replace(index, next)} />
          </div>
        </div>
      ))}

      <div className="flex flex-wrap gap-2">
        {(Object.keys(BLOCK_LABELS) as ContentBlock['type'][]).map((type) => (
          <Button
            key={type}
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => onChange([...value, blankBlock(type)])}
            leadingIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
          >
            {BLOCK_LABELS[type]}
          </Button>
        ))}
      </div>
    </div>
  );
}

function BlockFields({ block, onChange }: { block: ContentBlock; onChange: (block: ContentBlock) => void }) {
  switch (block.type) {
    case 'paragraph':
      return (
        <Textarea
          label="Text"
          rows={4}
          value={block.text}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
        />
      );

    case 'heading':
      return (
        <Input
          label="Heading"
          value={block.text}
          onChange={(event) => onChange({ ...block, text: event.target.value })}
        />
      );

    case 'quote':
      return (
        <>
          <Textarea
            label="Quote"
            rows={3}
            value={block.text}
            onChange={(event) => onChange({ ...block, text: event.target.value })}
          />
          <Input
            label="Attribution"
            placeholder="Jane Doe, Chief Executive"
            value={block.attribution}
            onChange={(event) => onChange({ ...block, attribution: event.target.value })}
          />
        </>
      );

    case 'list':
      return (
        <RepeatingRows
          label="Items"
          rows={block.items}
          onChange={(items) => onChange({ ...block, items })}
          blank=""
          render={(item, update) => (
            <Input aria-label="List item" value={item} onChange={(event) => update(event.target.value)} />
          )}
        />
      );

    case 'image':
      return (
        <>
          <MediaField
            label="Image"
            value={block.media.src}
            onChange={(src) => onChange({ ...block, media: { ...block.media, src } })}
          />
          <Input
            label="Alt text"
            hint="Describe the image for readers who cannot see it."
            value={block.media.alt}
            onChange={(event) => onChange({ ...block, media: { ...block.media, alt: event.target.value } })}
          />
          <Input
            label="Caption"
            value={block.media.caption ?? ''}
            onChange={(event) => onChange({ ...block, media: { ...block.media, caption: event.target.value } })}
          />
        </>
      );

    case 'stat':
      return (
        <RepeatingRows
          label="Figures"
          rows={block.items}
          onChange={(items) => onChange({ ...block, items })}
          blank={{ label: '', value: '' }}
          render={(item, update) => (
            <div className="flex flex-1 gap-2">
              <Input
                aria-label="Figure value"
                placeholder="300K"
                value={item.value}
                onChange={(event) => update({ ...item, value: event.target.value })}
                className="w-32"
              />
              <Input
                aria-label="Figure label"
                placeholder="BOE per day"
                value={item.label}
                onChange={(event) => update({ ...item, label: event.target.value })}
                className="flex-1"
              />
            </div>
          )}
        />
      );

    default:
      return null;
  }
}

interface RepeatingRowsProps<T> {
  label: string;
  rows: T[];
  blank: T;
  onChange: (rows: T[]) => void;
  render: (row: T, update: (next: T) => void) => React.ReactNode;
}

/** Add/remove list shared by the `list` and `stat` blocks — the only two that repeat. */
function RepeatingRows<T>({ label, rows, blank, onChange, render }: RepeatingRowsProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-semibold text-gray-700">{label}</span>

      {rows.map((row, index) => (
        <div key={index} className="flex items-start gap-2">
          <div className="flex-1">
            {render(row, (next) => onChange(rows.map((existing, position) => (position === index ? next : existing))))}
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            aria-label={`Remove ${label.toLowerCase()} row ${index + 1}`}
            onClick={() => onChange(rows.filter((_, position) => position !== index))}
          >
            <Trash2 className="h-4 w-4 text-burgundy" aria-hidden="true" />
          </Button>
        </div>
      ))}

      <div>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          onClick={() => onChange([...rows, structuredClone(blank)])}
          leadingIcon={<Plus className="h-3.5 w-3.5" aria-hidden="true" />}
        >
          Add row
        </Button>
      </div>
    </div>
  );
}
