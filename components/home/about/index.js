import cn from 'clsx'
import { ScrollableBox } from 'components/scrollable-box'
import { renderer } from 'contentful/renderer'
import { useStore } from 'lib/store'
import Image from 'next/image'
import s from './about.module.scss'

export const About = ({ data, className }) => {
  const selectedCollection = useStore((state) => state.selectedCollection)

  return (
    <section className={cn(s.about, className)}>
      <p className={cn(s.title, 'p text-bold text-uppercase text-muted')}>
        About
      </p>
      <ScrollableBox className={s.description}>
        {data && data.json ? (
          renderer(data)
        ) : (
          <p className="p">PHANTASY Merchandise Store.</p>
        )}
      </ScrollableBox>

      {selectedCollection?.image && selectedCollection.image.src && (
        <div className={s.collectionImage}>
          <p
            className={cn(
              s.imageTitle,
              'p text-bold text-uppercase text-muted'
            )}
          >
            {selectedCollection.title}
          </p>
          <div className={s.imageContainer}>
            <Image
              src={selectedCollection.image.src}
              alt={selectedCollection.image.alt || selectedCollection.title}
              width={300}
              height={300}
              className={s.image}
            />
          </div>
        </div>
      )}
    </section>
  )
}
