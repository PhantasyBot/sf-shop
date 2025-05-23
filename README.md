[![SATUS](https://assets.studiofreight.com/satus/header.png)](https://github.com/studio-freight/satus)

<!-- <p align="center">
  <a aria-label="Vercel logo" href="https://vercel.com">
    <img src="https://badgen.net/badge/icon/Next?icon=zeit&label&color=black&labelColor=black">
  </a>
  <br/>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/swr">
    <img alt="" src="https://badgen.net/npm/v/swr?color=black&labelColor=black">
  </a>
  <a aria-label="Package size" href="https://bundlephobia.com/result?p=swr">
    <img alt="" src="https://badgen.net/bundlephobia/minzip/swr?color=black&labelColor=black">
  </a>
  <a aria-label="License" href="https://github.com/vercel/swr/blob/main/LICENSE">
    <img alt="" src="https://badgen.net/npm/license/swr?color=black&labelColor=black">
  </a>
</p> -->

## Introduction

Satūs means start, beginning, planting, it's a set of tools we use as a template when starting a new project.

<br/>

## Composition

This starter kit is composed of:

- [Next.js](https://nextjs.org)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Spring](https://github.com/pmndrs/react-spring)
- [Embla](https://embla-carousel.com)
- [Lenis](https://github.com/studio-freight/lenis)
- [Clsx](https://www.npmjs.com/package/clsx)
- From [Radix UI](https://www.radix-ui.com/):
  - [Accordion](https://www.radix-ui.com/docs/primitives/components/accordion)

<br/>

## Features

This starter kit is composed of:

- SVG import through [@svgr/webpack](https://www.npmjs.com/package/@svgr/webpack)
- Sass architecture and tooling:
  - To VW Functions
  - Reset
  - Easings
- Hooks:
  - provided by @studio-freight/hamo
  - - useScroll
- Custom Cursor support
- Real Viewport component
- Grid Debugger
- Github workflow to render lighthouse on slack:
  make sure you update the `vercel_project_id` in `.github/workflows/lighthouse-on-vercel-preview-url.yml` to your Vercel project id.

<br/>

## Flavors

- [Light](https://github.com/studio-freight/satus) (you're here)
- [With Shopify](https://github.com/studio-freight/satus/tree/with-shopify)
- [With Contentful](https://github.com/studio-freight/satus/tree/with-contentful)
- [With react-three-fiber](https://github.com/studio-freight/satus/tree/with-r3f)
- [With OGL](https://github.com/studio-freight/satus/tree/with-ogl)

<br/>

## Authors

This toolkit is curated and maintained by the Studio Freight Things team:

- Clement Roche ([@clementroche\_](https://twitter.com/clementroche_)) – [Studio Freight](https://studiofreight.com)
- Guido Fier ([@uido15](https://twitter.com/uido15)) – [Studio Freight](https://studiofreight.com)
- Leandro Soengas ([@lsoengas](https://twitter.com/lsoengas)) - [Studio Freight](https://studiofreight.com)
- Franco Arza ([@arzafran](https://twitter.com/arzafran)) - [Studio Freight](https://studiofreight.com)

<br/>

## License

[The MIT License.](https://opensource.org/licenses/MIT)

# PHANTASY Shopify Store

This is a Shopify storefront built using Next.js.

## Setup

1. Clone this repository
2. Install dependencies using pnpm:
   ```
   pnpm install
   ```
3. Create a `.env.local` file in the root directory with the following variables:

   ```
   # Shopify
   NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com
   NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token

   # Site URL
   NEXT_PUBLIC_SITE_URL=http://localhost:3000

   # Logging (debug, info, warn, error, none)
   NEXT_PUBLIC_LOG_LEVEL=debug
   ```

4. Run the development server:
   ```
   pnpm dev
   ```

## Logging System

The application includes a robust logging system to help debug Shopify integration:

- Set `NEXT_PUBLIC_LOG_LEVEL` in your `.env.local` file to one of:
  - `debug`: Show all logs (most verbose)
  - `info`: Show info, warnings and errors
  - `warn`: Show only warnings and errors
  - `error`: Show only errors
  - `none`: Disable all logging

This logging system is particularly helpful for debugging Shopify product loading. When running the app with `debug` logging enabled, you'll see detailed information about:

- Shopify client initialization
- API requests and responses
- Product data fetching and formatting
- Error details with stack traces

## Troubleshooting Shopify Integration

If your products aren't appearing:

1. Check that your Shopify credentials are correct:

   - `NEXT_PUBLIC_SHOPIFY_DOMAIN` should be your full Shopify domain (e.g., `your-store.myshopify.com`)
   - `NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN` should be your Storefront API access token

2. Look at the browser console with logging enabled to see detailed errors

3. Verify that your Shopify store has products and they're published to the Storefront API

4. Confirm that the store domain is accessible and the API is responding (you should see this in the logs)

## Features

- Shopify integration for product listings
- Responsive design
- Cart functionality

## Building for Production

```
pnpm build
```

## Starting Production Server

```
pnpm start
```
