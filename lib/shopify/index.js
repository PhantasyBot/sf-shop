import { GraphQLClient } from 'graphql-request'
import logger from 'lib/utils/logger'
import {
  cartCreation,
  cartDiscountdate,
  cartLinesAdd,
  cartLinesUpdate,
  cartRemoveLineItem,
} from './mutations/mutations.graphql'
import { shopifyApiTest } from './queries/diagnostic.graphql'
import {
  allProducts,
  byHandle,
  byId,
  cartCheck,
  cartFetch,
  getCollection,
  getSchema,
} from './queries/queries.graphql'
import {
  allCollections,
  collectionProducts,
  minimalCollectionProducts,
  simpleProducts,
} from './queries/simplified-queries.graphql'

class Shopify {
  constructor() {
    this.domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
    this.accessToken = process.env.NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN

    // Direct console logs for debugging
    console.log('========== SHOPIFY CLIENT INITIALIZED ==========')
    console.log('Domain:', this.domain)
    console.log('Has Access Token:', !!this.accessToken)
    console.log(
      'Access Token (last 4 chars):',
      this.accessToken ? this.accessToken.slice(-4) : 'NONE'
    )

    logger.info('Shopify client initialized with:')
    logger.info(`Domain: ${this.domain ? this.domain : 'NOT SET'}`)
    logger.info(
      `Access Token: ${
        this.accessToken ? '****' + this.accessToken.slice(-4) : 'NOT SET'
      }`
    )

    // Validate configuration
    if (!this.domain || !this.accessToken) {
      console.error(
        'SHOPIFY CONFIGURATION ERROR: Missing domain or access token'
      )
      logger.error('Shopify configuration is incomplete. Check your .env file.')
      logger.info('Required environment variables:')
      logger.info('NEXT_PUBLIC_SHOPIFY_DOMAIN=your-store.myshopify.com')
      logger.info(
        'NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN=your-storefront-access-token'
      )
    }
  }

  async client(query, variables) {
    try {
      const endpoint = `https://${this.domain}/api/2023-01/graphql.json`

      // Direct console logs
      console.log('========== SHOPIFY API REQUEST ==========')
      console.log('Endpoint:', endpoint)
      console.log('Variables:', variables)
      console.log('Has access token:', !!this.accessToken)

      logger.debug(`Making Shopify API request to: ${endpoint}`)

      // Start timing the request
      const endTimer = logger.time('Shopify API request')
      console.time('DIRECT - Shopify API request time')

      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          'X-Shopify-Storefront-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      })

      const response = await graphQLClient.request(query, variables)
      endTimer() // End timing
      console.timeEnd('DIRECT - Shopify API request time')

      // Direct console log the response
      console.log('========== SHOPIFY API RESPONSE ==========')
      console.log('Response received:', !!response)
      console.log('Response keys:', response ? Object.keys(response) : 'None')

      // If this is a products query, log more details
      if (response && response.products) {
        console.log('Products found:', response.products.edges.length)
        console.log(
          'First few products:',
          response.products.edges.slice(0, 2).map((p) => ({
            id: p.node.id,
            title: p.node.title,
          }))
        )
      }

      logger.debug('Shopify API request successful')
      logger.debug('Request variables:', variables)

      return response
    } catch (error) {
      // Direct console error
      console.error('========== SHOPIFY API ERROR ==========')
      console.error('Error message:', error.message)
      console.error('Error stack:', error.stack)

      logger.error(`Shopify API request failed: ${error.message}`)
      logger.error('Request details:', {
        domain: this.domain,
        hasAccessToken: !!this.accessToken,
        variables,
      })

      if (error.response) {
        console.error('Error response data:', error.response)
        logger.object('Error response data', error.response, 'error')
      }

      throw error // Re-throw to be handled by caller
    }
  }

  formatProduct(product) {
    logger.debug(`Formatting product: ${product?.title || 'Unknown product'}`)
    console.log('Formatting product:', product?.title || 'Unknown product')

    try {
      const formattedProduct = {
        id: product.id.toString(),
        name: product?.title || '',
        tags: product.tags,
        description: product?.description || '',
        inStock: product.availableForSale,
        price: Number(product.priceRange.maxVariantPrice.amount).toFixed(0),
        images: product.media.edges.map((img) => ({
          src: img.node.image.originalSrc ?? null,
          alt: img.node.image.altText ?? null,
        })),
        slug: product?.handle || '/',
        options: product?.options
          ? product.options.map((o) => ({
              name: o.name ?? null,
              values: o.values.map((v) => v.value ?? null),
            }))
          : [{ name: null, value: null }],
        variants: product.variants.edges.map((variant) => {
          const size = variant.node?.selectedOptions?.find(
            (o) => o.name === 'Size'
          )?.value

          return {
            id: variant.node.id.toString(),
            name: variant.node?.title || '',
            price: variant?.node?.priceV2?.amount
              ? Number(variant.node.priceV2.amount).toFixed(0)
              : 0,
            isAvailable: variant.node.availableForSale,
            availableQuantity: variant.node.quantityAvailable,
            size: size ?? null,
            prodId: product.id.toString(),
            sellingPlans: variant.node.sellingPlanAllocations.edges.map(
              (plan) => ({
                sellingPlan: plan.node.sellingPlan,
              })
            ),
          }
        }),
      }

      logger.debug(`Product formatted successfully: ${formattedProduct.name}`)
      return formattedProduct
    } catch (error) {
      console.error('Error formatting product:', error.message)
      logger.error(`Error formatting product: ${error.message}`)
      logger.object('Problem product data', product, 'error')
      throw error // Re-throw to be handled by caller
    }
  }

  cartParser(cart) {
    if (!cart?.id) {
      logger.debug('Empty cart detected, returning default structure')
      return {
        id: null,
        checkoutUrl: null,
        totalPrice: null,
        discountCodes: null,
        products: [],
      }
    }

    const optionParser = (input) => {
      return {
        id: input.id,
        price: Number(input.priceV2.amount),
        option: input.selectedOptions[0].value,
        availableQuantity: input.quantityAvailable,
      }
    }

    return {
      id: cart.id,
      checkoutUrl: cart.checkoutUrl,
      totalPrice: cart.cost.subtotalAmount.amount,
      discountCodes: cart.discountCodes,
      products: cart.lines.edges.map((item) => {
        return {
          id: item.node.id,
          quantity: item.node.quantity,
          image: item.node.merchandise.image.originalSrc,
          name: item.node.merchandise.product.title,
          prodId: item.node.merchandise.product.id,
          handle: item.node.merchandise.product.handle,
          options: optionParser(item.node.merchandise),
          variants: item.node.merchandise.product.variants.edges.map(
            (variant) => ({
              options: optionParser(variant.node),
            })
          ),
          sellingPlan: item.node.sellingPlanAllocation?.sellingPlan,
        }
      }),
    }
  }

  collectionParser(collection) {
    return collection.products.edges.map((item) => item.node)
  }

  async getSchemaFields() {
    return await this.client(getSchema, {})
  }

  async getCollectionByHandle(handle) {
    logger.info(`Fetching collection by handle: ${handle}`)
    try {
      const { collectionByHandle } = await this.client(getCollection, {
        collectionHandle: handle,
      })
      return this.collectionParser(collectionByHandle)
    } catch (error) {
      logger.error(`Failed to fetch collection '${handle}': ${error.message}`)
      return []
    }
  }

  async getAllProducts(query = '') {
    console.log('========== GETTING ALL PRODUCTS ==========')
    console.log('Query:', query)
    console.log('Domain:', this.domain)
    console.log('Has Access Token:', !!this.accessToken)

    logger.info('Fetching all products', query ? `with query: ${query}` : '')

    try {
      const response = await this.client(allProducts, { query })

      if (!response || !response.products) {
        console.error('Invalid response structure - no products object')
        logger.error('Invalid response from Shopify getAllProducts query')
        logger.object('Response', response, 'error')
        return []
      }

      const { products } = response
      console.log('Products found:', products.edges.length)
      logger.info(`Found ${products.edges.length} products`)

      const formattedProducts = products.edges.map((p) =>
        this.formatProduct(p.node)
      )
      console.log('Formatted products:', formattedProducts.length)
      logger.debug(
        `Formatted ${formattedProducts.length} products successfully`
      )

      return formattedProducts
    } catch (error) {
      console.error('Failed to fetch products:', error.message)
      logger.error(`Failed to fetch products: ${error.message}`)
      return []
    }
  }

  async getProductByHandle(handle) {
    logger.info(`Fetching product by handle: ${handle}`)
    try {
      const { productByHandle } = await this.client(byHandle, { handle })
      return this.formatProduct(productByHandle)
    } catch (error) {
      logger.error(`Failed to fetch product '${handle}': ${error.message}`)
      return null
    }
  }

  async getProductById(id) {
    logger.info(`Fetching product by ID: ${id}`)
    try {
      const { product } = await this.client(byId, { id })
      return this.formatProduct(product)
    } catch (error) {
      logger.error(`Failed to fetch product ID '${id}': ${error.message}`)
      return null
    }
  }

  async createCart() {
    logger.info('Creating new cart')
    try {
      const { cartCreate } = await this.client(cartCreation, {})
      logger.info(`Cart created successfully with ID: ${cartCreate?.cart?.id}`)
      return cartCreate
    } catch (error) {
      logger.error(`Failed to create cart: ${error.message}`)
      return { cart: { id: null } }
    }
  }

  async fetchCart(cartId) {
    if (cartId.cartId) {
      logger.info(`Fetching cart: ${cartId.cartId}`)
      try {
        const fetchCart = await this.client(cartFetch, cartId)
        return this.cartParser(fetchCart.cart)
      } catch (error) {
        logger.error(
          `Failed to fetch cart '${cartId.cartId}': ${error.message}`
        )
        return { products: [] }
      }
    }

    logger.debug('No cart ID provided, returning empty cart')
    return { products: [] }
  }

  async checkCart(cartId) {
    if (cartId.cartId) {
      logger.info(`Checking cart: ${cartId.cartId}`)
      try {
        const { cart } = await this.client(cartCheck, cartId)
        return cart
      } catch (error) {
        logger.error(
          `Failed to check cart '${cartId.cartId}': ${error.message}`
        )
        return { id: null }
      }
    }
    return { id: null }
  }

  async addItemToCart(cart) {
    logger.info(`Adding item to cart: ${cart.cartId}`)
    return await this.client(cartLinesAdd, cart)
  }

  async removeItemToCart(cart) {
    logger.info(`Removing item from cart: ${cart.cartId}`)
    return await this.client(cartRemoveLineItem, cart)
  }

  async updateItemCart(cart) {
    logger.info(`Updating item in cart: ${cart.cartId}`)
    return await this.client(cartLinesUpdate, cart)
  }

  async updateCartDiscountCodes(cart) {
    logger.info(`Updating discount codes in cart: ${cart.cartId}`)
    try {
      const { cartDiscountCodesUpdate } = await this.client(
        cartDiscountdate,
        cart
      )
      return cartDiscountCodesUpdate
    } catch (error) {
      logger.error(`Failed to update discount codes: ${error.message}`)
      return null
    }
  }

  async getSimpleProducts(query = '') {
    console.log('========== GETTING SIMPLE PRODUCTS ==========')
    console.log('Query:', query)
    console.log('Domain:', this.domain)
    console.log('Has Access Token:', !!this.accessToken)

    logger.info(
      'Fetching products with simplified query',
      query ? `with query: ${query}` : ''
    )

    try {
      const response = await this.client(simpleProducts, { query })

      if (!response || !response.products) {
        console.error('Invalid response structure - no products object')
        logger.error('Invalid response from Shopify simpleProducts query')
        logger.object('Response', response, 'error')
        return []
      }

      const { products } = response
      console.log('Products found:', products.edges.length)
      logger.info(
        `Found ${products.edges.length} products with simplified query`
      )

      // Format products with a simpler structure
      const formattedProducts = products.edges
        .map((p) => {
          const product = p.node
          try {
            return {
              id: product.id.toString(),
              name: product?.title || '',
              description: product?.description || '',
              inStock: product.availableForSale,
              price: Number(product.priceRange.maxVariantPrice.amount).toFixed(
                0
              ),
              images: product.images.edges.map((img) => ({
                src: img.node.originalSrc ?? null,
                alt: img.node.altText ?? null,
              })),
              slug: product?.handle || '/',
              variants: product.variants.edges.map((variant) => {
                const size = variant.node?.selectedOptions?.find(
                  (o) => o.name === 'Size'
                )?.value

                return {
                  id: variant.node.id.toString(),
                  name: variant.node?.title || '',
                  price: variant?.node?.priceV2?.amount
                    ? Number(variant.node.priceV2.amount).toFixed(0)
                    : 0,
                  isAvailable: variant.node.availableForSale,
                  size: size ?? null,
                  prodId: product.id.toString(),
                }
              }),
            }
          } catch (error) {
            console.error('Error formatting simple product:', error.message)
            logger.error(`Error formatting simple product: ${error.message}`)
            logger.object('Problem product data', product, 'error')
            return null
          }
        })
        .filter(Boolean) // Remove any null products

      console.log('Formatted products:', formattedProducts.length)
      logger.debug(
        `Formatted ${formattedProducts.length} products successfully with simplified query`
      )

      return formattedProducts
    } catch (error) {
      console.error('Failed to fetch products (simplified):', error.message)
      logger.error(`Failed to fetch products (simplified): ${error.message}`)
      return []
    }
  }

  async testApiConnection() {
    console.log('========== TESTING SHOPIFY API CONNECTION ==========')
    console.log('Domain:', this.domain)
    console.log('Has Access Token:', !!this.accessToken)

    logger.info('Testing Shopify API connectivity')

    try {
      const response = await this.client(shopifyApiTest, {})

      if (!response || !response.shop) {
        console.error('Invalid response structure - no shop object')
        logger.error('Invalid response from Shopify test query')
        logger.object('Response', response, 'error')
        return false
      }

      console.log('Shopify API connection successful!')
      console.log('Shop name:', response.shop.name)
      console.log('Domain:', response.shop.primaryDomain.url)

      logger.info(
        `Successfully connected to Shopify store: ${response.shop.name}`
      )
      return true
    } catch (error) {
      console.error('Failed to connect to Shopify API:', error.message)
      logger.error(`Failed to connect to Shopify API: ${error.message}`)

      // Log more detailed error information
      if (error.response) {
        console.error('Error status:', error.response.status)
        console.error('Error details:', error.response.errors)
      }

      return false
    }
  }

  async getCollections() {
    console.log('========== GETTING COLLECTIONS ==========')
    console.log('Domain:', this.domain)
    console.log('Has Access Token:', !!this.accessToken)

    logger.info('Fetching all collections')

    try {
      const response = await this.client(allCollections, {})

      if (!response || !response.collections) {
        console.error('Invalid response structure - no collections object')
        logger.error('Invalid response from Shopify allCollections query')
        logger.object('Response', response, 'error')
        return []
      }

      const { collections } = response
      console.log('Collections found:', collections.edges.length)
      logger.info(`Found ${collections.edges.length} collections`)

      // Format collections
      const formattedCollections = collections.edges.map((c) => {
        const collection = c.node
        return {
          id: collection.id.toString(),
          title: collection.title || '',
          handle: collection.handle || '',
          description: collection.description || '',
          image: collection.image
            ? {
                src: collection.image.originalSrc || '',
                alt: collection.image.altText || collection.title || '',
              }
            : null,
        }
      })

      console.log('Formatted collections:', formattedCollections.length)
      logger.debug(
        `Formatted ${formattedCollections.length} collections successfully`
      )

      return formattedCollections
    } catch (error) {
      console.error('Failed to fetch collections:', error.message)
      logger.error(`Failed to fetch collections: ${error.message}`)
      return []
    }
  }

  async getCollectionProducts(handle) {
    console.log(`========== GETTING COLLECTION PRODUCTS: ${handle} ==========`)
    console.log('Domain:', this.domain)
    console.log('Has Access Token:', !!this.accessToken)

    logger.info(`Fetching products from collection: ${handle}`)

    try {
      // Try with the full query first
      console.log('Trying full collection products query')
      const response = await this.client(collectionProducts, { handle })

      if (!response || !response.collectionByHandle) {
        console.error(
          'Invalid response structure - no collectionByHandle object'
        )
        logger.error('Invalid response from Shopify collectionProducts query')

        // Try with minimal query as fallback
        console.log('Trying minimal collection products query as fallback')
        try {
          const minimalResponse = await this.client(minimalCollectionProducts, {
            handle,
          })

          if (!minimalResponse || !minimalResponse.collectionByHandle) {
            console.error(
              'Minimal query also failed - invalid response structure'
            )
            return { collection: null, products: [] }
          }

          return this.formatMinimalCollectionProducts(
            minimalResponse.collectionByHandle
          )
        } catch (minError) {
          console.error('Minimal collection query failed:', minError.message)
          return { collection: null, products: [] }
        }
      }

      const { collectionByHandle } = response

      if (!collectionByHandle) {
        console.log(`Collection not found: ${handle}`)
        logger.warn(`Collection not found: ${handle}`)
        return { collection: null, products: [] }
      }

      const collectionData = {
        id: collectionByHandle.id.toString(),
        title: collectionByHandle.title || '',
        handle: collectionByHandle.handle || '',
        description: collectionByHandle.description || '',
      }

      console.log(
        'Products in collection:',
        collectionByHandle.products.edges.length
      )

      // Format products
      const formattedProducts = collectionByHandle.products.edges
        .map((p) => {
          const product = p.node
          try {
            return {
              id: product.id.toString(),
              name: product?.title || '',
              description: product?.description || '',
              inStock: product.availableForSale,
              price: Number(product.priceRange.maxVariantPrice.amount).toFixed(
                0
              ),
              images: product.images.edges.map((img) => ({
                src: img.node.originalSrc ?? null,
                alt: img.node.altText ?? null,
              })),
              slug: product?.handle || '/',
              variants: product.variants.edges.map((variant) => {
                const size = variant.node?.selectedOptions?.find(
                  (o) => o.name === 'Size'
                )?.value

                return {
                  id: variant.node.id.toString(),
                  name: variant.node?.title || '',
                  price: variant?.node?.priceV2?.amount
                    ? Number(variant.node.priceV2.amount).toFixed(0)
                    : 0,
                  isAvailable: variant.node.availableForSale,
                  size: size ?? null,
                  prodId: product.id.toString(),
                }
              }),
            }
          } catch (error) {
            console.error('Error formatting collection product:', error.message)
            logger.error(
              `Error formatting collection product: ${error.message}`
            )
            logger.object('Problem product data', product, 'error')
            return null
          }
        })
        .filter(Boolean) // Remove any null products

      console.log('Formatted collection products:', formattedProducts.length)

      return { collection: collectionData, products: formattedProducts }
    } catch (error) {
      console.error('Failed to fetch collection products:', error.message)

      // Try with minimal query as fallback
      console.log(
        'Main query failed. Trying minimal collection products query as fallback'
      )
      try {
        const minimalResponse = await this.client(minimalCollectionProducts, {
          handle,
        })

        if (!minimalResponse || !minimalResponse.collectionByHandle) {
          console.error(
            'Minimal query also failed - invalid response structure'
          )
          return { collection: null, products: [] }
        }

        return this.formatMinimalCollectionProducts(
          minimalResponse.collectionByHandle
        )
      } catch (minError) {
        console.error('Minimal collection query failed:', minError.message)
        return { collection: null, products: [] }
      }
    }
  }

  formatMinimalCollectionProducts(collectionByHandle) {
    if (!collectionByHandle) {
      return { collection: null, products: [] }
    }

    const collectionData = {
      id: collectionByHandle.id.toString(),
      title: collectionByHandle.title || '',
      handle: collectionByHandle.handle || '',
      description: collectionByHandle.description || '',
    }

    console.log(
      'Minimal products in collection:',
      collectionByHandle.products.edges.length
    )

    // Format products with minimal data
    const formattedProducts = collectionByHandle.products.edges
      .map((p) => {
        const product = p.node
        try {
          return {
            id: product.id.toString(),
            name: product?.title || '',
            description: product?.description || '',
            inStock: product.availableForSale,
            price: Number(product.priceRange.maxVariantPrice.amount).toFixed(0),
            images: product.featuredImage
              ? [
                  {
                    src: product.featuredImage.originalSrc ?? null,
                    alt: product.featuredImage.altText ?? null,
                  },
                ]
              : [],
            slug: product?.handle || '/',
            variants: [
              {
                id: product.id.toString(),
                name: 'Default',
                price: Number(
                  product.priceRange.maxVariantPrice.amount
                ).toFixed(0),
                isAvailable: product.availableForSale,
                size: 'One Size',
                prodId: product.id.toString(),
              },
            ],
          }
        } catch (error) {
          console.error(
            'Error formatting minimal collection product:',
            error.message
          )
          return null
        }
      })
      .filter(Boolean) // Remove any null products

    console.log(
      'Formatted minimal collection products:',
      formattedProducts.length
    )

    return { collection: collectionData, products: formattedProducts }
  }
}

export default Shopify
