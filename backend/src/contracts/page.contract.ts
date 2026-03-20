import { z } from 'zod';

export const PAGE_STATUS_VALUES = ['draft', 'published', 'archived'] as const;
export const PAGE_VISIBILITY_VALUES = ['public', 'private', 'unlisted'] as const;

export type PageStatus = (typeof PAGE_STATUS_VALUES)[number];
export type PageVisibility = (typeof PAGE_VISIBILITY_VALUES)[number];

export const pageStatusSchema = z.enum(PAGE_STATUS_VALUES, {
  errorMap: () => ({ message: 'Status da pagina invalido. Use draft, published ou archived.' }),
});

export const pageVisibilitySchema = z.enum(PAGE_VISIBILITY_VALUES, {
  errorMap: () => ({ message: 'Visibilidade invalida. Use public, private ou unlisted.' }),
});

export const pageLifecycleSchema = z
  .object({
    status: pageStatusSchema.default('draft'),
    visibility: pageVisibilitySchema.default('public'),
    publishedAt: z.string().datetime({ offset: true }).nullable().optional(),
  })
  .superRefine((value, ctx) => {
    const hasPublishedAt = Boolean(value.publishedAt);

    if (value.status === 'published' && !hasPublishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publishedAt'],
        message: 'publishedAt e obrigatorio quando status = published.',
      });
    }

    if (value.status !== 'published' && hasPublishedAt) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['publishedAt'],
        message: 'publishedAt so pode existir quando status = published.',
      });
    }
  });

export type PageLifecycleDto = z.infer<typeof pageLifecycleSchema>;

export type LifecycleLike = {
  status?: string | null;
  visibility?: string | null;
  publishedAt?: Date | null;
  createdAt?: Date | null;
  paymentStatus?: 'pending' | 'paid' | string | null;
};

export function isPageStatus(value: unknown): value is PageStatus {
  return typeof value === 'string' && (PAGE_STATUS_VALUES as readonly string[]).includes(value);
}

export function isPageVisibility(value: unknown): value is PageVisibility {
  return typeof value === 'string' && (PAGE_VISIBILITY_VALUES as readonly string[]).includes(value);
}

export function resolvePageLifecycle(input: LifecycleLike): {
  status: PageStatus;
  visibility: PageVisibility;
  publishedAt: Date | null;
} {
  const status = isPageStatus(input.status)
    ? input.status
    : input.paymentStatus === 'paid'
      ? 'published'
      : 'draft';
  const visibility = isPageVisibility(input.visibility) ? input.visibility : 'public';

  if (status !== 'published') {
    return {
      status,
      visibility,
      publishedAt: null,
    };
  }

  return {
    status,
    visibility,
    publishedAt: input.publishedAt ?? input.createdAt ?? new Date(),
  };
}

export function canAccessPageByLifecycle(input: {
  status: PageStatus;
  visibility: PageVisibility;
  ownerUserId: string;
  requesterUserId?: string;
}): boolean {
  if (input.status !== 'published') {
    return false;
  }

  if (input.visibility === 'private') {
    return input.requesterUserId === input.ownerUserId;
  }

  return true;
}
