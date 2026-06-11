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

const draftDoc = { status: 'draft', publishedAt: null };
const publishedDoc = { status: 'published', publishedAt: '2024-01-01T00:00:00.000Z' };

beforeEach(() => {
  vi.mocked(unstable_useDocumentActions).mockReturnValue({ publish: mockPublish } as any);
  vi.mocked(unstable_useDocument).mockReturnValue({ document: draftDoc } as any);
  vi.mocked(useForm).mockImplementation((_name, selector) => selector({ modified: false, isSubmitting: false } as any)
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

describe('ConfirmPublishAction — dialog config', () => {
  it('returns a dialog of type "dialog"', () => {
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.dialog.type).toBe('dialog');
  });

  it('has a non-empty title and content', () => {
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.dialog.title).toBeTruthy();
    expect(result.current.dialog.content).toBeTruthy();
  });

  it('label reads "Publish"', () => {
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.label).toBe('Publish');
  });
});

describe('ConfirmPublishAction — disabled logic', () => {
  it('is enabled for a draft document with a documentId', () => {
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.disabled).toBe(false);
  });

  it('is disabled when the active tab is already "published"', () => {
    const { result } = renderHook(() =>
      ConfirmPublishAction({ ...DEFAULT_PROPS, activeTab: 'published' })
    );
    expect(result.current.disabled).toBe(true);
  });

  it('is disabled while the form is submitting', () => {
    vi.mocked(useForm).mockImplementation((_name, selector) => selector({ modified: false, isSubmitting: true } as any)
    );
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.disabled).toBe(true);
  });

  it('is disabled when the document is already published and nothing has changed', () => {
    vi.mocked(unstable_useDocument).mockReturnValue({ document: publishedDoc } as any);
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.disabled).toBe(true);
  });

  it('is enabled when the document is published but the form has unsaved changes', () => {
    vi.mocked(unstable_useDocument).mockReturnValue({ document: publishedDoc } as any);
    vi.mocked(useForm).mockImplementation((_name, selector) => selector({ modified: true, isSubmitting: false } as any)
    );
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.disabled).toBe(false);
  });

  it('is disabled for an unsaved new document (no documentId)', () => {
    const { result } = renderHook(() =>
      ConfirmPublishAction({ ...DEFAULT_PROPS, documentId: undefined })
    );
    expect(result.current.disabled).toBe(true);
  });

  it('is disabled when publishedAt is non-null even if status is not "published"', () => {
    vi.mocked(unstable_useDocument).mockReturnValue({
      document: { status: 'modified', publishedAt: '2024-01-01T00:00:00.000Z' },
    } as any);
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    expect(result.current.disabled).toBe(true);
  });
});

describe('ConfirmPublishAction — onConfirm', () => {
  it('calls publish with the correct collectionType, model, and documentId', async () => {
    const { result } = renderHook(() => ConfirmPublishAction(DEFAULT_PROPS));
    await result.current.dialog.onConfirm();
    expect(mockPublish).toHaveBeenCalledOnce();
    expect(mockPublish).toHaveBeenCalledWith(
      {
        collectionType: DEFAULT_PROPS.collectionType,
        model: DEFAULT_PROPS.model,
        documentId: DEFAULT_PROPS.documentId,
      },
      draftDoc
    );
  });
});
