import type { StrapiApp } from '@strapi/strapi/admin';
import { ConfirmPublishAction } from './components/ConfirmPublishAction';

export default {
  register(app: StrapiApp) {
    app.registerPlugin({
      id: 'publish-confirmation',
      name: 'publish-confirmation',
    });
  },

  bootstrap(app: StrapiApp) {
    const contentManager = app.getPlugin('content-manager');
    if (!contentManager) return;

    const apis = contentManager.apis as {
      addDocumentAction: (mutator: (actions: Array<{ type?: string }>) => Array<unknown>) => void;
    };

    apis.addDocumentAction((actions: Array<{ type?: string }>) =>
      actions.map((action) => (action.type === 'publish' ? ConfirmPublishAction : action))
    );
  },
};
