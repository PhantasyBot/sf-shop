import { useOutsideClickEvent } from '@studio-freight/hamo'
import cn from 'clsx'
import { ComposableImage } from 'components/composable-image'
import { ScrollableBox } from 'components/scrollable-box'
import { useStore } from 'lib/store'
import logger from 'lib/utils/logger'
import { useEffect, useRef } from 'react'
import shallow from 'zustand/shallow'
import s from './gallery.module.scss'

export function Gallery() {
  const contentRef = useRef(null)
  const [selectedProduct, galleryVisible, setGalleryVisible] = useStore(
    (state) => [
      state.selectedProduct,
      state.galleryVisible,
      state.setGalleryVisible,
    ],
    shallow
  )

  useOutsideClickEvent(contentRef, () => setGalleryVisible(false))

  useEffect(() => {
    const escFunction = (event) => {
      if (event.keyCode === 27) {
        setGalleryVisible(false)
      }
    }

    document.addEventListener('keydown', escFunction, false)
    return () => document.removeEventListener('keydown', escFunction, false)
  }, [])

  // Log the current state for debugging
  useEffect(() => {
    if (galleryVisible) {
      logger.debug('Gallery visible state:', {
        galleryVisible,
        hasSelectedProduct: !!selectedProduct,
        productName: selectedProduct?.name || 'None',
      })
    }
  }, [galleryVisible, selectedProduct])

  // If Gallery is visible but no product is selected, close the gallery
  useEffect(() => {
    if (galleryVisible && !selectedProduct) {
      logger.warn('Gallery opened with no selected product, closing gallery')
      setGalleryVisible(false)
    }
  }, [galleryVisible, selectedProduct, setGalleryVisible])

  // Don't render content if no product is selected
  if (!selectedProduct && galleryVisible) {
    return null
  }

  return (
    <div className={cn(s.gallery, galleryVisible && s.visible)}>
      <button className={s.close} onClick={() => setGalleryVisible(false)}>
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 26 26">
          <path
            stroke="var(--green)"
            d="M11 1H1v10M15 1h10v10M15 25h10V15M11 25H1V15m7.8-6.2 8.4 8.4m0-8.4-8.4 8.4"
          />
        </svg>
        <span className={cn(s.text, 'p-xs text-uppercase')}>Close</span>
      </button>
      <ScrollableBox className={s.scroller} reset={!galleryVisible}>
        {selectedProduct && selectedProduct.images && (
          <div key={'i'} ref={contentRef}>
            <ComposableImage
              sources={selectedProduct.images}
              width={1038}
              height={611}
              large
            />
          </div>
        )}
      </ScrollableBox>
    </div>
  )
}
