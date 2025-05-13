import { GraphQLClient } from 'graphql-request'
import logger from 'lib/utils/logger'
import {
  cartCreation,
  cartDiscountdate,
  cartLinesAdd,
  cartLinesUpdate,
  cartRemoveLineItem,
} from './mutations/mutations.graphql'
import {
  allProducts,
  byHandle,
  byId,
  cartCheck,
  cartFetch,
  getCollection,
  getSchema,
} from './queries/queries.graphql'

class Shopify {
  constructor() {
    this.domain = process.env.NEXT_PUBLIC_SHOPIFY_DOMAIN
    this.accessToken = process.env.NEXT_SHOPIFY_STOREFRONT_ACCESS_TOKEN

    logger.info('Shopify client initialized with:')
    logger.info(`Domain: ${this.domain ? this.domain : 'NOT SET'}`)
    logger.info(
      `Access Token: ${
        this.accessToken ? '****' + this.accessToken.slice(-4) : 'NOT SET'
      }`
    )

    // Validate configuration
    if (!this.domain || !this.accessToken) {
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
      logger.debug(`Making Shopify API request to: ${endpoint}`)

      // Start timing the request
      const endTimer = logger.time('Shopify API request')

      const graphQLClient = new GraphQLClient(endpoint, {
        headers: {
          'X-Shopify-Storefront-Access-Token': this.accessToken,
          'Content-Type': 'application/json',
        },
      })

      const response = await graphQLClient.request(query, variables)
      endTimer() // End timing

      logger.debug('Shopify API request successful')
      logger.debug('Request variables:', variables)

      return response
    } catch (error) {
      logger.error(`Shopify API request failed: ${error.message}`)
      logger.error('Request details:', {
        domain: this.domain,
        hasAccessToken: !!this.accessToken,
        variables,
      })

      if (error.response) {
        logger.object('Error response data', error.response, 'error')
      }

      throw error // Re-throw to be handled by caller
    }
  }

  formatProduct(product) {
    logger.debug(`Formatting product: ${product?.title || 'Unknown product'}`)

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
    logger.info('Fetching all products', query ? `with query: ${query}` : '')

    try {
      const response = await this.client(allProducts, { query })

      if (!response || !response.products) {
        logger.error('Invalid response from Shopify getAllProducts query')
        logger.object('Response', response, 'error')
        return []
      }

      const { products } = response
      logger.info(`Found ${products.edges.length} products`)

      const formattedProducts = products.edges.map((p) =>
        this.formatProduct(p.node)
      )
      logger.debug(
        `Formatted ${formattedProducts.length} products successfully`
      )

      return formattedProducts
    } catch (error) {
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
}

export default Shopify
