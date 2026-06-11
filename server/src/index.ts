import type { Core } from '@strapi/strapi';

const register = ({ strapi }: { strapi: Core.Strapi }) => {};
const bootstrap = ({ strapi }: { strapi: Core.Strapi }) => {};
const destroy = ({ strapi }: { strapi: Core.Strapi }) => {};

export default { register, bootstrap, destroy };
