import { Image } from '@studio-freight/compono'
import cn from 'clsx'
import { CollectionSelector } from 'components/home/collection-selector'
import { ProjectAccordion } from 'components/project-accordion'
import { renderer } from 'contentful/renderer'
import s from './layout-mobile.module.scss'

const LayoutMobile = ({
  products,
  studioFreight,
  collections = [],
  isLoadingProducts = false,
}) => {
  return (
    <div className={s.content}>
      <section className={s['hero-image']}>
        <Image
          src="/mobile-temp-images/tetsuo.jpg"
          alt="tetsuo placeholder face"
          fill
        />
      </section>

      {collections.length > 0 && (
        <section className={cn(s.collections, 'layout-block')}>
          <CollectionSelector />
        </section>
      )}

      <section className={cn(s.projects, 'layout-block')}>
        {isLoadingProducts ? (
          <div className={s.loading}>
            <p className="p">Loading products...</p>
          </div>
        ) : (
          <ProjectAccordion data={products} />
        )}
      </section>

      <section className={s.image}>
        <Image
          src={'/mobile-temp-images/sf-game-boy.png'}
          alt={'tetsuo placeholder face'}
          fill
        />
      </section>
      <section className={cn(s.about, 'layout-block')}>
        <p className={cn(s.title, 'p text-bold text-uppercase text-muted')}>
          About
        </p>
        <div className={s.description}>{renderer(studioFreight.about)}</div>
      </section>
    </div>
  )
}

export { LayoutMobile }
