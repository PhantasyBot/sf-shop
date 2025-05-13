import { Image } from '@studio-freight/compono'
import { useOutsideClickEvent } from '@studio-freight/hamo'
import cn from 'clsx'
import { ScrollableBox } from 'components/scrollable-box'
import { useStore } from 'lib/store'
import logger from 'lib/utils/logger'
import { useEffect, useRef } from 'react'
import shallow from 'zustand/shallow'
import s from './gallery.module.scss'

export function Gallery() {
  const contentRef = useRef(null)
  const [
    selectedProduct,
    galleryVisible,
    setGalleryVisible,
    selectedImageIndex,
    setSelectedImageIndex,
  ] = useStore(
    (state) => [
      state.selectedProduct,
      state.galleryVisible,
      state.setGalleryVisible,
      state.selectedImageIndex,
      state.setSelectedImageIndex,
    ],
    shallow
  )

  useOutsideClickEvent(contentRef, () => setGalleryVisible(false))

  useEffect(() => {
    const keyHandler = (event) => {
      if (event.keyCode === 27) {
        // ESC key
        setGalleryVisible(false)
      } else if (event.keyCode === 37 && galleryVisible) {
        // Left arrow key
        goToPrevImage()
      } else if (event.keyCode === 39 && galleryVisible) {
        // Right arrow key
        goToNextImage()
      }
    }

    document.addEventListener('keydown', keyHandler, false)
    return () => document.removeEventListener('keydown', keyHandler, false)
  }, [galleryVisible, selectedProduct, selectedImageIndex])

  // Log the current state for debugging
  useEffect(() => {
    if (galleryVisible) {
      logger.debug('Gallery visible state:', {
        galleryVisible,
        hasSelectedProduct: !!selectedProduct,
        productName: selectedProduct?.name || 'None',
        imageCount: selectedProduct?.images?.length || 0,
        currentImageIndex: selectedImageIndex,
      })
    }
  }, [galleryVisible, selectedProduct, selectedImageIndex])

  // If Gallery is visible but no product is selected, close the gallery
  useEffect(() => {
    if (galleryVisible && !selectedProduct) {
      logger.warn('Gallery opened with no selected product, closing gallery')
      setGalleryVisible(false)
    }
  }, [galleryVisible, selectedProduct, setGalleryVisible])

  // Handle navigation
  const goToPrevImage = () => {
    if (selectedProduct?.images?.length > 1) {
      setSelectedImageIndex(
        selectedImageIndex === 0
          ? selectedProduct.images.length - 1
          : selectedImageIndex - 1
      )
    }
  }

  const goToNextImage = () => {
    if (selectedProduct?.images?.length > 1) {
      setSelectedImageIndex(
        selectedImageIndex === selectedProduct.images.length - 1
          ? 0
          : selectedImageIndex + 1
      )
    }
  }

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
      <div className={s.navigation}>
        {selectedProduct?.images?.length > 1 && (
          <>
            <button className={s.navButton} onClick={goToPrevImage}>
              <span className="p-xs text-uppercase">Prev</span>
            </button>
            <span className={s.counter}>
              {selectedImageIndex + 1} / {selectedProduct.images.length}
            </span>
            <button className={s.navButton} onClick={goToNextImage}>
              <span className="p-xs text-uppercase">Next</span>
            </button>
          </>
        )}
      </div>
      <ScrollableBox className={s.scroller} reset={!galleryVisible}>
        {selectedProduct && selectedProduct.images && (
          <div key={'i'} ref={contentRef} className={s.imageContainer}>
            <Image
              src={selectedProduct.images[selectedImageIndex]?.src}
              alt={
                selectedProduct.images[selectedImageIndex]?.alt ||
                selectedProduct.name
              }
              width={1038}
              height={611}
              layout="responsive"
              objectFit="contain"
              className={s.fullImage}
            />
          </div>
        )}
      </ScrollableBox>
    </div>
  )
}
