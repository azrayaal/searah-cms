import { useEffect, useState } from 'react';

import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Save } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';

import { PageHeader } from '@/components/layout/PageHeader';
import { MediaField } from '@/components/media/MediaPicker';
import { AttachmentsPanel } from '@/components/newsletter/AttachmentsPanel';
import { BlockEditor } from '@/components/newsletter/BlockEditor';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Checkbox, Input, Select, Textarea } from '@/components/ui/Field';
import { ErrorState, FormAlert, LoadingState } from '@/components/ui/Feedback';
import { applyFieldErrors } from '@/hooks/useAuth';
import { useCreateNewsletter, useNewsletter, useUpdateNewsletter } from '@/hooks/useNewsletters';
import { ENTITY_CODES, NEWSLETTER_CATEGORIES } from '@/services/newsletter.service';
import { useAuthStore } from '@/store/auth.store';
import type { ContentBlock } from '@/types/api';

/**
 * Mirrors the server's Zod schema.
 *
 * Duplicated deliberately rather than shared: client validation is for fast feedback,
 * server validation is the security boundary. If they ever disagree, the server wins —
 * the client copy can only ever be a convenience.
 */
const formSchema = z.object({
  title: z.string().trim().min(3, 'Title must be at least 3 characters').max(300),
  slug: z
    .string()
    .trim()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers and hyphens only')
    .max(180)
    .optional()
    .or(z.literal('')),
  excerpt: z.string().max(2000).optional(),
  category: z.string().min(1, 'Choose a category'),
  entityCode: z.string().optional(),
  thumbnailUrl: z.string().max(500).optional(),
  coverUrl: z.string().max(500).optional(),
  pdfUrl: z.string().max(500).optional(),
  authorName: z.string().max(150).optional(),
  authorRole: z.string().max(150).optional(),
  readingTime: z.string().max(40).optional(),
  tags: z.string().max(400).optional(),
  featured: z.boolean().default(false),
  showOnHome: z.boolean().default(true),
  seoTitle: z.string().max(200).optional(),
  seoDescription: z.string().max(400).optional(),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']).default('DRAFT'),
  // `datetime-local` value, i.e. "2026-07-20T09:30" in the editor's own timezone.
  publishedAt: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

/** Tags round-trip between a comma-separated input and the API's string array. */
function parseTags(value: string | undefined): string[] {
  if (!value) return [];
  return [
    ...new Set(
      value
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
    ),
  ];
}

/**
 * ISO instant to the `datetime-local` shape the input expects, in local time.
 * Slicing the ISO string would show UTC and silently shift the date for any editor
 * east or west of Greenwich.
 */
function toLocalInput(iso: string | null): string {
  if (!iso) return '';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

const EMPTY: FormValues = {
  title: '',
  slug: '',
  excerpt: '',
  category: '',
  entityCode: '',
  thumbnailUrl: '',
  coverUrl: '',
  pdfUrl: '',
  authorName: '',
  authorRole: '',
  readingTime: '',
  tags: '',
  featured: false,
  showOnHome: true,
  seoTitle: '',
  seoDescription: '',
  status: 'DRAFT',
  publishedAt: '',
};

/**
 * A tinted, ruled band at the top of each form card.
 *
 * The form is long enough that unbroken white reads as one undifferentiated wall.
 * Giving every section a bounded header turns it into a handful of legible blocks.
 */
function FormSectionHeader({ title, description }: { title: string; description?: string }) {
  return (
    <div className="rounded-t-card border-b border-gray-200 bg-surface-page px-6 py-4">
      <CardHeader title={title} description={description} />
    </div>
  );
}

export default function NewsletterFormPage() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const can = useAuthStore((state) => state.can);

  const [formError, setFormError] = useState<string | null>(null);

  const { data: existing, isPending: isLoading, isError, error: loadError, refetch } = useNewsletter(id);
  const create = useCreateNewsletter();
  const update = useUpdateNewsletter(id ?? '');

  const {
    register,
    handleSubmit,
    reset,
    setError,
    setValue,
    watch,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<FormValues>({ resolver: zodResolver(formSchema), defaultValues: EMPTY });

  /**
   * The body lives outside react-hook-form.
   *
   * RHF is built around registered inputs, and the block model is a nested
   * discriminated union whose shape changes with the block type — expressing that as
   * registered field paths costs far more than it saves for a value that is edited
   * wholesale and validated on the server anyway.
   */
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);

  // Media fields are RHF values but not RHF inputs: the picker sets them imperatively.
  const setUrl = (field: 'thumbnailUrl' | 'coverUrl' | 'pdfUrl') => (url: string) =>
    setValue(field, url, { shouldDirty: true });

  // Populates the form once the record arrives. `reset` rather than defaultValues,
  // because the data is not available on first render.
  useEffect(() => {
    if (!existing) return;

    reset({
      title: existing.title,
      slug: existing.slug,
      excerpt: existing.excerpt ?? '',
      category: existing.category,
      entityCode: existing.entityCode ?? '',
      thumbnailUrl: existing.thumbnailUrl ?? '',
      coverUrl: existing.coverUrl ?? '',
      pdfUrl: existing.pdfUrl ?? '',
      authorName: existing.authorName ?? '',
      authorRole: existing.authorRole ?? '',
      readingTime: existing.readingTime ?? '',
      tags: existing.tags.join(', '),
      featured: existing.featured,
      showOnHome: existing.showOnHome,
      seoTitle: existing.seoTitle ?? '',
      seoDescription: existing.seoDescription ?? '',
      status: existing.status,
      publishedAt: toLocalInput(existing.publishedAt),
    });

    setBlocks(existing.content ?? []);
  }, [existing, reset]);

  // Warns before losing unsaved edits on a browser navigation.
  useEffect(() => {
    if (!isDirty) return;

    const handler = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [isDirty]);

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null);

    // Empty strings become null so the API stores an absent value rather than "".
    const payload = {
      title: values.title,
      ...(values.slug ? { slug: values.slug } : {}),
      excerpt: values.excerpt || null,
      category: values.category,
      entityCode: values.entityCode || null,
      thumbnailUrl: values.thumbnailUrl || null,
      coverUrl: values.coverUrl || null,
      pdfUrl: values.pdfUrl || null,
      authorName: values.authorName || null,
      authorRole: values.authorRole || null,
      readingTime: values.readingTime || null,
      tags: parseTags(values.tags),
      featured: values.featured,
      showOnHome: values.showOnHome,
      seoTitle: values.seoTitle || null,
      seoDescription: values.seoDescription || null,
      status: values.status,
      content: blocks,
      // Left blank, the server keeps whatever date the article already had and stamps
      // one on first publish — so an empty field means "don't override", not "clear".
      publishedAt: values.publishedAt ? new Date(values.publishedAt).toISOString() : null,
    };

    try {
      if (isEdit) {
        await update.mutateAsync(payload);
      } else {
        await create.mutateAsync(payload);
      }

      navigate('/newsletters');
    } catch (error) {
      setFormError(applyFieldErrors<FormValues>(error, setError));
    }
  });

  if (isEdit && isLoading) return <LoadingState label="Loading article…" />;

  if (isEdit && isError) {
    return (
      <ErrorState
        message={loadError instanceof Error ? loadError.message : 'Could not load this article'}
        onRetry={refetch}
      />
    );
  }

  return (
    <>
      <PageHeader
        title={isEdit ? 'Edit article' : 'New article'}
        description={isEdit ? existing?.title : 'Publish a new article to the corporate newsroom.'}
        breadcrumbs={[
          { label: 'Dashboard', to: '/' },
          { label: 'Newsletter', to: '/newsletters' },
          { label: isEdit ? 'Edit' : 'New' },
        ]}
        actions={
          <Link to="/newsletters">
            <Button variant="secondary" leadingIcon={<ArrowLeft className="h-4 w-4" aria-hidden="true" />}>
              Back
            </Button>
          </Link>
        }
      />

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          {formError && <FormAlert message={formError} />}

          <Card flush>
            <FormSectionHeader title="Content" description="The headline and summary shown across the site." />

            <div className="flex flex-col gap-5 p-6">
              <Input
                label="Title"
                required
                placeholder="Board sanctions the largest development of the decade"
                error={errors.title?.message}
                {...register('title')}
              />

              <Input
                label="Slug"
                hint={
                  isEdit
                    ? 'Changing this breaks existing links to the article.'
                    : 'Generated from the title if left blank.'
                }
                placeholder="board-sanctions-geng-north"
                error={errors.slug?.message}
                {...register('slug')}
              />

              <Textarea
                label="Excerpt"
                rows={3}
                hint="Shown on cards and in search results."
                error={errors.excerpt?.message}
                {...register('excerpt')}
              />
            </div>
          </Card>

          <Card flush>
            <FormSectionHeader title="Media" description="Images and attachments for the article." />

            <div className="flex flex-col gap-5 p-6">
              <MediaField
                label="Thumbnail"
                hint="Shown on cards across the site."
                error={errors.thumbnailUrl?.message}
                value={watch('thumbnailUrl') ?? ''}
                onChange={setUrl('thumbnailUrl')}
              />
              <MediaField
                label="Cover image"
                hint="The banner at the top of the article."
                error={errors.coverUrl?.message}
                value={watch('coverUrl') ?? ''}
                onChange={setUrl('coverUrl')}
              />
              <MediaField
                label="PDF edition"
                hint="Optional downloadable edition."
                kind="document"
                error={errors.pdfUrl?.message}
                value={watch('pdfUrl') ?? ''}
                onChange={setUrl('pdfUrl')}
              />
            </div>
          </Card>

          <Card flush>
            <FormSectionHeader
              title="Article body"
              description="Blocks render in this order on the published page."
            />

            <div className="p-6">
              <BlockEditor value={blocks} onChange={setBlocks} />
            </div>
          </Card>

          <Card flush>
            <FormSectionHeader
              title="Attachments"
              description="Downloadable files listed at the foot of the article."
            />

            <div className="p-6">
              {isEdit && id ? (
                <AttachmentsPanel newsletterId={id} />
              ) : (
                // Attachments are rows keyed to an article id, so there is nothing to
                // attach them to until the article has been saved once.
                <p className="rounded-card border border-dashed border-gray-200 px-4 py-6 text-center text-sm text-gray-500">
                  Save the article first, then add attachments.
                </p>
              )}
            </div>
          </Card>

          <Card flush>
            <FormSectionHeader
              title="Search engine listing"
              description="Overrides the title and excerpt for search results."
            />

            <div className="flex flex-col gap-5 p-6">
              <Input label="SEO title" error={errors.seoTitle?.message} {...register('seoTitle')} />
              <Textarea
                label="SEO description"
                rows={2}
                error={errors.seoDescription?.message}
                {...register('seoDescription')}
              />
            </div>
          </Card>
        </div>

        {/* Sidebar: publishing and metadata */}
        <div className="flex flex-col gap-6">
          <Card flush>
            <FormSectionHeader title="Publishing" description="Where and when this article appears." />

            <div className="flex flex-col gap-5 p-6">
              <Select
                label="Status"
                // Publishing is a separate permission, so an Editor sees the control
                // disabled rather than absent — the workflow stays legible to them.
                disabled={!can('newsletter:publish')}
                hint={can('newsletter:publish') ? undefined : 'Your role cannot publish; an admin must approve.'}
                error={errors.status?.message}
                options={[
                  { value: 'DRAFT', label: 'Draft' },
                  { value: 'PUBLISHED', label: 'Published' },
                  { value: 'ARCHIVED', label: 'Archived' },
                ]}
                {...register('status')}
              />

              <Input
                type="datetime-local"
                label="Publication date"
                hint="Leave blank to stamp the moment it first goes live."
                disabled={!can('newsletter:publish')}
                error={errors.publishedAt?.message}
                {...register('publishedAt')}
              />

              <Select
                label="Category"
                required
                placeholder="Choose a category"
                error={errors.category?.message}
                options={NEWSLETTER_CATEGORIES.map((value) => ({ value, label: value }))}
                {...register('category')}
              />

              <Select
                label="Operating company"
                error={errors.entityCode?.message}
                options={ENTITY_CODES.map((entity) => ({ value: entity.value, label: entity.label }))}
                {...register('entityCode')}
              />

              <Checkbox label="Featured" hint="Promotes the article to the newsroom hero." {...register('featured')} />
              <Checkbox label="Show on homepage" {...register('showOnHome')} />
            </div>
          </Card>

          <Card flush>
            <FormSectionHeader title="Byline" description="Attribution and discovery metadata." />

            <div className="flex flex-col gap-5 p-6">
              <Input label="Author name" error={errors.authorName?.message} {...register('authorName')} />
              <Input label="Author role" error={errors.authorRole?.message} {...register('authorRole')} />
              <Input
                label="Reading time"
                placeholder="6 min read"
                error={errors.readingTime?.message}
                {...register('readingTime')}
              />
              <Input
                label="Tags"
                hint="Comma-separated."
                placeholder="deepwater, investment"
                error={errors.tags?.message}
                {...register('tags')}
              />
            </div>
          </Card>

          <Button
            type="submit"
            size="lg"
            fullWidth
            isLoading={isSubmitting || create.isPending || update.isPending}
            leadingIcon={<Save className="h-4 w-4" aria-hidden="true" />}
          >
            {isEdit ? 'Save changes' : 'Create article'}
          </Button>
        </div>
      </form>
    </>
  );
}
