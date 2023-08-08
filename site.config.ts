import { siteConfig } from './lib/site-config'

export default siteConfig({
  // the site's root Notion page (required)
  rootNotionPageId: '60144bafb6674c039661c3b2ae8a2ec2',

  // if you want to restrict pages to a single notion workspace (optional)
  // (this should be a Notion ID; see the docs for how to extract this)
  rootNotionSpaceId: '36648e96-b4aa-40c1-9067-fa4eff3caad4',
  // rootNotionSpaceId: null,

  // basic site info (required)
  name: 'Circolo Scacchi Cantù',
  domain: 'club-scacchi-cantu.notion.site',
  author: 'Circolo Scacchi Cantù',

  // open graph metadata (optional)
  description: 'Circolo Scacchi Cantù Site',

  // social usernames (optional)
  // twitter: '',
  // github: 'giammyisjammy',
  // linkedin: '',
  // mastodon: '#', // optional mastodon profile URL, provides link verification
  // newsletter: '#', // optional newsletter URL
  // youtube: '#', // optional youtube channel name or `channel/UCGbXXXXXXXXXXXXXXXXXXXXXX`
  instagram: 'csc_cantu',
  facebook: 'circoloscacchicantu',

  // default notion icon and cover images for site-wide consistency (optional)
  // page-specific values will override these site-wide defaults
  defaultPageIcon: null,
  defaultPageCover: null,
  defaultPageCoverPosition: 0.5,

  // whether or not to enable support for LQIP preview images (optional)
  isPreviewImageSupportEnabled: true,

  // whether or not redis is enabled for caching generated preview images (optional)
  // NOTE: if you enable redis, you need to set the `REDIS_HOST` and `REDIS_PASSWORD`
  // environment variables. see the readme for more info
  isRedisEnabled: false,

  // map of notion page IDs to URL paths (optional)
  // any pages defined here will override their default URL paths
  // example:
  //
  // pageUrlOverrides: {
  //   '/foo': '067dd719a912471ea9a3ac10710e7fdf',
  //   '/bar': '0be6efce9daf42688f65c76b89f8eb27'
  // }
  pageUrlOverrides: null,

  // whether to use the default notion navigation style or a custom one with links to
  // important pages
  navigationStyle: 'default'
  // navigationStyle: 'custom',
  // navigationLinks: [
  //   {
  //     title: 'About',
  //     pageId: 'f1199d37579b41cbabfc0b5174f4256a'
  //   },
  //   {
  //     title: 'Contact',
  //     pageId: '6a29ebcb935a4f0689fe661ab5f3b8d1'
  //   }
  // ]
})
