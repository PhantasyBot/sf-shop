import cn from 'clsx'
import { ScrollableBox } from 'components/scrollable-box'
import { useStore } from 'lib/store'
import logger from 'lib/utils/logger'
import { useEffect } from 'react'
import shallow from 'zustand/shallow'
import s from './products.module.scss'

export const Products = ({ products, isLoading = false, className }) => {
  const [selectedProduct, setSelectedProduct] = useStore(
    (state) => [state.selectedProduct, state.setSelectedProduct],
    shallow
  )

  // Log available products when component mounts
  useEffect(() => {
    logger.info(
      `Products component mounted with ${products?.length || 0} products`
    )
    if (products?.length > 0) {
      logger.debug(
        'Available products:',
        products.map((p) => p.name)
      )
    } else {
      logger.warn('No products available to display')
    }
  }, [products])

  // Initialize selectedProduct when products change or on mount
  useEffect(() => {
    if (products?.length > 0 && !selectedProduct) {
      logger.info(`Setting initial selected product: ${products[0].name}`)
      setSelectedProduct(products[0])
    }
  }, [products, selectedProduct, setSelectedProduct])

  // If no products, show empty state
  if (isLoading) {
    return (
      <section className={cn(s.products, className)}>
        <p className={cn(s.title, 'p text-bold text-uppercase text-muted')}>
          Products
        </p>
        <div className={s.empty}>
          <p className="p">Loading products...</p>
        </div>
      </section>
    )
  }

  if (!products || products.length === 0) {
    return (
      <section className={cn(s.products, className)}>
        <p className={cn(s.title, 'p text-bold text-uppercase text-muted')}>
          Products
        </p>
        <div className={s.empty}>
          <p className="p">No products available</p>
        </div>
      </section>
    )
  }

  return (
    <section className={cn(s.products, className)}>
      <p className={cn(s.title, 'p text-bold text-uppercase text-muted')}>
        Products
      </p>
      <ScrollableBox className={s.list}>
        <ul>
          {products.map((product) => (
            <li
              key={product.id}
              className={cn(
                selectedProduct?.id === product.id && s.active,
                s['list-item']
              )}
            >
              <button
                onClick={() => {
                  logger.debug(`Product selected: ${product.name}`)
                  setSelectedProduct(product)
                }}
              >
                <p className="p text-bold text-uppercase">{product.name}</p>
                <p className="p-xs text-uppercase">{product.price}$</p>
              </button>
            </li>
          ))}
        </ul>
      </ScrollableBox>
    </section>
  )
}
