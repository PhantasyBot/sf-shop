import { useMediaQuery } from '@studio-freight/hamo'
import cn from 'clsx'
import { About } from 'components/home/about'
import { CollectionSelector } from 'components/home/collection-selector'
import { Products } from 'components/home/products'
import { ProductDetails } from 'components/home/products-details'
import { ClientOnly } from 'components/isomorphic'
import { LayoutMobile } from 'components/layout-mobile'
import { Layout } from 'layouts/default'
import Shopify from 'lib/shopify'
import { useStore } from 'lib/store'
import logger from 'lib/utils/logger'
import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import shallow from 'zustand/shallow'
import s from './home.module.scss'

const Gallery = dynamic(
  () => import('components/gallery').then(({ Gallery }) => Gallery),
  {
    ssr: false,
  }
)

export default function Home({
  studioFreight,
  footerLinks,
  productsArray,
  collections = [],
}) {
  const isDesktop = useMediaQuery('(min-width: 800px)')
  const isMobile = useMediaQuery('(max-width: 800px)')

  const [setCollections, selectedCollection, setSelectedCollection] = useStore(
    (state) => [
      state.setCollections,
      state.selectedCollection,
      state.setSelectedCollection,
    ],
    shallow
  )

  const [displayedProducts, setDisplayedProducts] = useState(productsArray)
  const [isLoadingProducts, setIsLoadingProducts] = useState(false)

  // Set collections in the store
  useEffect(() => {
    setCollections(collections)
    // If no collection is selected, select the first one
    if (collections?.length > 0 && !selectedCollection) {
      setSelectedCollection(collections[0])
    }
  }, [collections, setCollections, selectedCollection, setSelectedCollection])

  // Fetch products for the selected collection
  useEffect(() => {
    async function fetchCollectionProducts() {
      if (selectedCollection) {
        setIsLoadingProducts(true)
        try {
          console.log(
            `Fetching products for collection: ${selectedCollection.handle}`
          )
          const store = new Shopify()
          const result = await store.getCollectionProducts(
            selectedCollection.handle
          )

          console.log('Collection products fetch result:', {
            collectionFound: !!result.collection,
            productsCount: result.products?.length || 0,
            products: result.products?.slice(0, 2) || [],
          })

          if (result.products && result.products.length > 0) {
            setDisplayedProducts(result.products)
            logger.info(
              `Loaded ${result.products.length} products from collection "${selectedCollection.title}"`
            )
          } else {
            console.warn(
              `No products found in collection "${selectedCollection.title}", using default products`
            )
            setDisplayedProducts(productsArray)
            logger.warn(
              `No products found in collection "${selectedCollection.title}", using default products`
            )
          }
        } catch (error) {
          console.error(`Error fetching collection products:`, error)
          logger.error(`Error fetching collection products: ${error.message}`)
          setDisplayedProducts(productsArray)
        } finally {
          setIsLoadingProducts(false)
        }
      } else {
        setDisplayedProducts(productsArray)
      }
    }

    fetchCollectionProducts()
  }, [selectedCollection, productsArray])

  return (
    <Layout
      theme="dark"
      principles={studioFreight.principles}
      studioInfo={{
        phone: studioFreight.phoneNumber,
        email: studioFreight.email,
      }}
      footerLinks={footerLinks}
    >
      {isDesktop === true ? (
        <ClientOnly>
          <div className={cn(s.content, 'layout-grid')}>
            <About data={studioFreight.about} className={s.aboutSection} />
            {collections.length > 0 && (
              <CollectionSelector className={s.collectionsSection} />
            )}
            <Products
              products={displayedProducts}
              isLoading={isLoadingProducts}
              className={s.productsSection}
            />
            <ProductDetails className={s.detailsSection} />
          </div>
        </ClientOnly>
      ) : (
        <LayoutMobile
          studioFreight={studioFreight}
          products={displayedProducts}
          collections={collections}
          isLoadingProducts={isLoadingProducts}
        />
      )}
      {isMobile === true && (
        <LayoutMobile
          studioFreight={studioFreight}
          products={displayedProducts}
          collections={collections}
          isLoadingProducts={isLoadingProducts}
        />
      )}
      <Gallery />
    </Layout>
  )
}

export async function getStaticProps() {
  logger.info('Starting getStaticProps for home page')

  // Mock data to replace Contentful data
  const studioFreight = {
    principles: ['Quality', 'Design', 'Innovation'],
    about: {
      json: {
        nodeType: 'document',
        data: {},
        content: [
          {
            nodeType: 'paragraph',
            data: {},
            content: [
              {
                nodeType: 'text',
                value:
                  'PHANTASY is an gaming & entertainment studio focused on interactive experiences with AI companions.\n\n\n Browse our store and support your favorite AI V-Tuber.',
                marks: [],
                data: {},
              },
            ],
          },
        ],
      },
    },
    phoneNumber: '+1 (424) 222-9967',
    email: 'hello@phantasy.bot',
  }

  // Mock footer links
  const footerLinks = [
    { label: 'Instagram', href: 'https://instagram.com/phantasydotbot' },
    { label: 'Twitter', href: 'https://twitter.com/phantasydotbot' },
    { label: 'Contact', href: '/contact' },
  ]

  // Try to get products from Shopify if configured
  let productsArray = []
  let collections = []

  try {
    logger.info('Initializing Shopify client')
    const store = new Shopify()

    // Log environment variables (masked)
    logger.info('Environment variables:')
    console.log('DIRECT LOG - Environment variables:')
    console.log(
      `NEXT_PUBLIC_SHOPIFY_DOMAIN: ${
        process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'NOT SET'
      }`
    )
    console.log(
      `NEXT_PUBLIC_LOG_LEVEL: ${process.env.NEXT_PUBLIC_LOG_LEVEL || 'NOT SET'}`
    )
    logger.info(
      `NEXT_PUBLIC_SHOPIFY_DOMAIN: ${
        process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN || 'NOT SET'
      }`
    )
    logger.info(
      `NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN: ${
        process.env.NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN
          ? '****' + process.env.NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN.slice(-4)
          : 'NOT SET'
      }`
    )

    // First test the API connection with a simple query
    const isConnected = await store.testApiConnection()

    if (!isConnected) {
      logger.warn('Could not connect to Shopify API, using mock product data')
      throw new Error('Failed to connect to Shopify API')
    }

    // Fetch collections
    logger.info('Fetching collections from Shopify')
    const collectionsResult = await store.getCollections()

    if (collectionsResult && collectionsResult.length > 0) {
      logger.info(
        `Successfully fetched ${collectionsResult.length} collections from Shopify`
      )
      collections = collectionsResult
    } else {
      logger.warn('No collections returned from Shopify')
    }

    logger.info('Fetching products from Shopify')
    const endTimer = logger.time('Fetching Shopify products')

    // Try to get products with the simplified query first
    console.log('First trying simplified products query')
    let products = await store.getSimpleProducts()

    // If simplified query returns no products, fall back to the original query
    if (!products || products.length === 0) {
      console.log(
        'Simplified query returned no products, trying original query'
      )
      products = await store.getAllProducts()
    }

    endTimer()

    // Log the result for debugging
    console.log('========== SHOPIFY PRODUCTS RESULT ==========')
    console.log('Products found:', products ? products.length : 0)
    if (products && products.length > 0) {
      console.log('First product:', products[0].name)
    } else {
      console.log('No products found')
    }

    if (products && products.length > 0) {
      logger.info(
        `Successfully fetched ${products.length} products from Shopify`
      )
      logger.debug(
        'Product names:',
        products.map((p) => p.name)
      )
      productsArray = products
    } else {
      logger.warn('No products returned from Shopify')
    }
  } catch (error) {
    logger.error(`Failed to fetch Shopify products: ${error.message}`)
    logger.error('Stack trace:', error.stack)

    // Additional environment validation
    if (!process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN) {
      logger.error(
        'NEXT_PUBLIC_SHOPIFY_DOMAIN is not set in environment variables'
      )
    }
    if (!process.env.NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN) {
      logger.error(
        'NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN is not set in environment variables'
      )
    }

    // Mock product data when Shopify is not configured
    logger.info('Using mock product data instead')
    productsArray = [
      {
        id: 'mock-product-1',
        name: 'Sample Product 1',
        price: '19.99',
        images: [{ src: '/placeholder.jpg', alt: 'Sample Product 1' }],
        slug: 'sample-product-1',
        description: 'This is a sample product.',
        inStock: true,
        variants: [
          {
            id: 'variant-1-1',
            size: 'S',
            isAvailable: true,
            price: '19.99',
            availableQuantity: 10,
          },
          {
            id: 'variant-1-2',
            size: 'M',
            isAvailable: true,
            price: '19.99',
            availableQuantity: 5,
          },
          {
            id: 'variant-1-3',
            size: 'L',
            isAvailable: false,
            price: '19.99',
            availableQuantity: 0,
          },
        ],
      },
      {
        id: 'mock-product-2',
        name: 'Sample Product 2',
        price: '29.99',
        images: [{ src: '/placeholder.jpg', alt: 'Sample Product 2' }],
        slug: 'sample-product-2',
        description: 'This is another sample product.',
        inStock: true,
        variants: [
          {
            id: 'variant-2-1',
            size: 'One Size',
            isAvailable: true,
            price: '29.99',
            availableQuantity: 20,
          },
        ],
      },
    ]
  }

  logger.info('Completed getStaticProps for home page')

  return {
    props: {
      studioFreight,
      footerLinks,
      productsArray,
      collections,
      id: 'home',
    },
    revalidate: 30,
  }
}
