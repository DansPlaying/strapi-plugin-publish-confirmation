# strapi-plugin-publish-confirmation

A Strapi v5 plugin that adds a confirmation dialog before publishing content, preventing accidental publishes in the Content Manager.

## Features

- Intercepts the **Publish** button in the edit view, panel, preview, and relation modal
- Shows a native Strapi confirmation dialog before any publish action
- Zero configuration — works out of the box
- Uses Strapi's built-in document action API (upgrade-safe)

## Requirements

- Strapi v5.x
- Node.js >= 18

## Installation

```bash
npm install strapi-plugin-publish-confirmation
```

## Configuration

Enable the plugin in `config/plugins.ts`:

```ts
export default () => ({
  'publish-confirmation': {
    enabled: true,
  },
});
```

Then rebuild the admin panel:

```bash
npm run build
npm run develop
```

## How it works

The plugin replaces Strapi's built-in `PublishAction` with a wrapped version that always returns a `dialog` descriptor. Strapi's document action API natively supports dialogs — when an action returns `dialog: { type: 'dialog', ... }`, clicking the button opens a confirm/cancel dialog before the action fires.

No custom modal component is needed; the confirmation UI is rendered by Strapi itself.

## Development

```bash
# Install dependencies
npm install

# Build the plugin
npm run build

# Watch mode (for use with watch:link)
npm run watch
```

## Publishing to npm

Create a git tag to trigger the GitHub Actions workflow:

```bash
git tag v1.0.0
git push origin v1.0.0
```

Add your `NPM_TOKEN` as a GitHub Actions secret before pushing the tag.

## License

MIT
