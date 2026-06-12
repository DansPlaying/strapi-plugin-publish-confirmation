import { useState } from 'react';
import { useIntl } from 'react-intl';
import {
  unstable_useDocument as useDocument,
  unstable_useDocumentActions as useDocumentActions,
} from '@strapi/strapi/admin';
import { useForm } from '@strapi/admin/strapi-admin';

interface DocumentActionProps {
  activeTab: string;
  documentId?: string;
  model: string;
  collectionType: string;
  document?: Record<string, unknown>;
}

const ConfirmPublishAction = ({
  activeTab,
  documentId,
  model,
  collectionType,
}: DocumentActionProps) => {
  const { formatMessage } = useIntl();
  const { publish } = useDocumentActions();
  const { document } = useDocument({ documentId, collectionType, model }, { skip: !documentId });
  const [isPublishing, setIsPublishing] = useState(false);

  const modified = useForm('ConfirmPublishAction', ({ modified }) => modified);
  const formValues = useForm('ConfirmPublishAction', ({ values }) => values);

  const isDocumentPublished =
    (document?.status as string) === 'published' ||
    (document?.publishedAt as string | null) !== null;

  const performPublish = async () => {
    setIsPublishing(true);
    try {
      await publish({ collectionType, model, documentId }, formValues ?? {});
    } finally {
      setIsPublishing(false);
    }
  };

  return {
    disabled:
      activeTab === 'published' ||
      (!modified && isDocumentPublished) ||
      (!modified && !documentId),
    label: formatMessage({ id: 'app.utils.publish', defaultMessage: 'Publish' }),
    dialog: {
      type: 'dialog' as const,
      title: formatMessage({
        id: 'publish-confirmation.dialog.title',
        defaultMessage: 'Publish content',
      }),
      content: formatMessage({
        id: 'publish-confirmation.dialog.message',
        defaultMessage: 'Are you sure you want to publish these changes? This will make the content publicly available.',
      }),
      loading: isPublishing,
      onConfirm: performPublish,
    } as any,
  };
};

ConfirmPublishAction.type = 'publish';
ConfirmPublishAction.position = ['panel', 'preview', 'relation-modal'] as const;

export { ConfirmPublishAction };
