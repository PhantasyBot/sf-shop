import cn from 'clsx'
import { ScrollableBox } from 'components/scrollable-box'
import { useStore } from 'lib/store'
import { useEffect } from 'react'
import shallow from 'zustand/shallow'
import s from './collection-selector.module.scss'

export const CollectionSelector = ({ className }) => {
  const [collections, selectedCollection, setSelectedCollection] = useStore(
    (state) => [
      state.collections,
      state.selectedCollection,
      state.setSelectedCollection,
    ],
    shallow
  )

  // Set the first collection as selected when collections are loaded
  useEffect(() => {
    if (collections?.length > 0 && !selectedCollection) {
      setSelectedCollection(collections[0])
    }
  }, [collections, selectedCollection, setSelectedCollection])

  if (!collections || collections.length === 0) {
    return null
  }

  return (
    <div className={cn(s.collectionSelector, className)}>
      <h2 className={cn('p text-bold text-uppercase text-muted', s.title)}>
        Collections
      </h2>
      <div className={s.collections}>
        {collections.map((collection) => (
          <button
            key={collection.id}
            className={cn(
              s.collection,
              collection.id === selectedCollection?.id && s.active,
              'p-s'
            )}
            onClick={() => setSelectedCollection(collection)}
          >
            {collection.title}
          </button>
        ))}
      </div>

      {selectedCollection?.description && (
        <div className={s.collectionDescription}>
          <ScrollableBox>
            <p className="p">{selectedCollection.description}</p>
          </ScrollableBox>
        </div>
      )}
    </div>
  )
}
