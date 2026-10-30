import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('react-intl', () => ({
  useIntl: () => ({
    formatMessage: ({ defaultMessage }: { defaultMessage: string }) => defaultMessage,
  }),
}));

const mockPublish = vi.fn();

vi.mock('@strapi/strapi/admin', () => ({
  unstable_useDocument: vi.fn(),
  unstable_useDocumentActions: vi.fn(),
}));

vi.mock('@strapi/admin/strapi-admin', () => ({
  useForm: vi.fn(),
}));

import { unstable_useDocument, unstable_useDocumentActions } from '@strapi/strapi/admin';
import { useForm } from '@strapi/admin/strapi-admin';
import { ConfirmPublishAction } from './ConfirmPublishAction';

const DEFAULT_PROPS = {
  activeTab: 'draft',
  documentId: 'doc-1',
  model: 'api::post.post',
  collectionType: 'collection-types',
};

type Props = Parameters<typeof ConfirmPublishAction>[0];

// The action is `null` for a content type without Draft & Publish.
const renderRaw = (props: Props) => renderHook(() => ConfirmPublishAction(props)).result;
const renderEnabled = (props: Props = DEFAULT_PROPS) =>
  renderRaw(props) as { current: NonNullable<ReturnType<typeof ConfirmPublishAction>> };

const draftDoc = { status: 'draft', publishedAt: null };
const publishedDoc = { status: 'published', publishedAt: '2024-01-01T00:00:00.000Z' };
const formValues = { title: 'Test Post' };
const draftAndPublishSchema = { options: { draftAndPublish: true } };

const mockDocument = (document: Record<string, unknown>, schema: unknown) =>
  vi.mocked(unstable_useDocument).mockReturnValue({ document, schema } as any);

beforeEach(() => {
  vi.mocked(unstable_useDocumentActions).mockReturnValue({ publish: mockPublish } as any);
  mockDocument(draftDoc, draftAndPublishSchema);
  vi.mocked(useForm).mockImplementation((_name, selector) =>
    selector({ modified: false, isSubmitting: false, values: formValues } as any)
  );
  mockPublish.mockReset();
});

describe('ConfirmPublishAction — static properties', () => {
  it('has type "publish" so Strapi replaces the built-in action', () => {
    expect(ConfirmPublishAction.type).toBe('publish');
  });

  it('covers all three render positions', () => {
    expect(ConfirmPublishAction.position).toEqual(
      expect.arrayContaining(['panel', 'preview', 'relation-modal'])
    );
  });
});

describe('ConfirmPublishAction — content types without Draft & Publish', () => {
  it('returns null when draftAndPublish is disabled, like the built-in action', () => {
    mockDocument(publishedDoc, { options: { draftAndPublish: false } });
    const result = renderRaw(DEFAULT_PROPS);
    expect(result.current).toBeNull();
  });

  it('returns null when the schema declares no draftAndPublish option', () => {
    mockDocument(draftDoc, { options: {} });
    const result = renderRaw(DEFAULT_PROPS);
    expect(result.current).toBeNull();
  });

  it('returns null while the schema is not loaded yet', () => {
    mockDocument(draftDoc, undefined);
    const result = renderRaw(DEFAULT_PROPS);
    expect(result.current).toBeNull();
  });

  it('returns null for a new document too (no documentId)', () => {
    mockDocument(draftDoc, { options: { draftAndPublish: false } });
    const result = renderRaw({ ...DEFAULT_PROPS, documentId: undefined });
    expect(result.current).toBeNull();
  });

  it('still returns the action when draftAndPublish is enabled', () => {
    const result = renderRaw(DEFAULT_PROPS);
    expect(result.current).not.toBeNull();
  });
});

describe('ConfirmPublishAction — dialog config', () => {
  it('returns a dialog of type "dialog"', () => {
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.dialog.type).toBe('dialog');
  });

  it('has a non-empty title and content', () => {
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.dialog.title).toBeTruthy();
    expect(result.current.dialog.content).toBeTruthy();
  });

  it('label reads "Publish"', () => {
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.label).toBe('Publish');
  });
});

describe('ConfirmPublishAction — disabled logic', () => {
  it('is enabled for a draft document with a documentId', () => {
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.disabled).toBe(false);
  });

  it('is disabled when the active tab is already "published"', () => {
    const result = renderEnabled({ ...DEFAULT_PROPS, activeTab: 'published' });
    expect(result.current.disabled).toBe(true);
  });

  it('is disabled while the form is submitting', () => {
    vi.mocked(useForm).mockImplementation((_name, selector) => selector({ modified: false, isSubmitting: true } as any)
    );
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.disabled).toBe(true);
  });

  it('is disabled when the document is already published and nothing has changed', () => {
    mockDocument(publishedDoc, draftAndPublishSchema);
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.disabled).toBe(true);
  });

  it('is enabled when the document is published but the form has unsaved changes', () => {
    mockDocument(publishedDoc, draftAndPublishSchema);
    vi.mocked(useForm).mockImplementation((_name, selector) => selector({ modified: true, isSubmitting: false } as any)
    );
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.disabled).toBe(false);
  });

  it('is disabled for an unsaved new document (no documentId)', () => {
    const result = renderEnabled({ ...DEFAULT_PROPS, documentId: undefined });
    expect(result.current.disabled).toBe(true);
  });

  it('is disabled when publishedAt is non-null even if status is not "published"', () => {
    mockDocument(
      { status: 'modified', publishedAt: '2024-01-01T00:00:00.000Z' },
      draftAndPublishSchema
    );
    const result = renderEnabled(DEFAULT_PROPS);
    expect(result.current.disabled).toBe(true);
  });
});

describe('ConfirmPublishAction — onConfirm', () => {
  it('calls publish with the correct collectionType, model, and documentId', async () => {
    const result = renderEnabled(DEFAULT_PROPS);
    await result.current.dialog.onConfirm();
    expect(mockPublish).toHaveBeenCalledOnce();
    expect(mockPublish).toHaveBeenCalledWith(
      {
        collectionType: DEFAULT_PROPS.collectionType,
        model: DEFAULT_PROPS.model,
        documentId: DEFAULT_PROPS.documentId,
      },
      formValues
    );
  });
});
