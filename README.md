# strapi-plugin-publish-confirmation

Adds a confirmation step to the **Publish** button in Strapi v5's Content Manager. Instead of publishing immediately, editors see a dialog asking them to confirm — making accidental publishes impossible.

## What it does

When an editor clicks **Publish**, a dialog appears:

> **Publish content**
> Are you sure you want to publish these changes? This will make the content publicly available.
>
> [ Cancel ]  [ Confirm ]

Cancelling does nothing. Confirming publishes the document normally. The button is smart — it stays disabled when there is nothing new to publish (document already published with no pending changes).

The confirmation dialog appears everywhere the Publish button can be clicked:
- The document edit view
- The preview panel
- Relation modals

## Requirements

- Strapi v5.x
- Node.js >= 18

## Installation

```bash
# pnpm
pnpm add strapi-plugin-publish-confirmation

# yarn
yarn add strapi-plugin-publish-confirmation

# bun
bun add strapi-plugin-publish-confirmation
```

Enable the plugin in `config/plugins.ts` (or `config/plugins.js`):

```ts
export default () => ({
  'publish-confirmation': {
    enabled: true,
  },
});
```

Rebuild and restart:

```bash
# pnpm
pnpm build && pnpm develop

# yarn
yarn build && yarn develop

# bun
bun run build && bun run develop
```

No further configuration needed.

## Reporting issues

Found a bug or have a feature request? Open an issue on [GitHub](https://github.com/DansPlaying/strapi-plugin-publish-confirmation/issues).

## License

MIT
