import { useEffect, useState } from 'react';
import api from '../services/api';

type GalleryItem = {
  imageId?: number;
  title: string;
  category: string;
  image: string;
};

type SiteImage = {
  imageId: number;
  title?: string;
  description?: string;
  imageUrl: string;
};

const fallbackGalleryItems: GalleryItem[] = [
  { title: 'Awards', category: 'Awards', image: '' },
  { title: 'Social Service', category: 'Social', image: '' },
  { title: 'Charitable Service', category: 'Charitable', image: '' },
  { title: 'Spiritual Service', category: 'Spiritual', image: '' },
  { title: 'Medical Service', category: 'Medical', image: '' },
  { title: 'Community Support', category: 'Social', image: '' },
];

const categories = ['All', 'Awards', 'Social', 'Charitable', 'Spiritual', 'Medical'];

function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(fallbackGalleryItems);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const deriveCategory = (image: SiteImage) => {
    const text = `${image.title || ''} ${image.description || ''}`.toLowerCase();

    if (text.includes('award')) return 'Awards';
    if (text.includes('charitable') || text.includes('charity') || text.includes('donation')) return 'Charitable';
    if (text.includes('spiritual') || text.includes('puja') || text.includes('satsang')) return 'Spiritual';
    if (text.includes('medical') || text.includes('health') || text.includes('camp')) return 'Medical';

    return 'Social';
  };

  const loadGalleryImages = async () => {
    try {
      const response = await api.get('/images/placement/GALLERY');
      const images: SiteImage[] = Array.isArray(response.data) ? response.data : [];

      if (images.length === 0) {
        setGalleryItems(fallbackGalleryItems);
        return;
      }

      const items = images.map((image) => ({
        imageId: image.imageId,
        title: image.title || 'SDHS Activity',
        category: deriveCategory(image),
        image: image.imageUrl,
      }));

      setGalleryItems(items);
    } catch (error) {
      console.error('Error loading gallery images:', error);
      setGalleryItems(fallbackGalleryItems);
    }
  };

  const filteredItems =
    selectedCategory === 'All'
      ? galleryItems
      : galleryItems.filter((item) => item.category === selectedCategory);

  return (
    <section id="gallery" className="section-padding">
      <div className="container">
        <div className="text-center mb-4">
          <span className="sdhs-section-label">Gallery</span>
          <h2 className="fw-bold mt-2">Moments from SDHS Activities</h2>
          <p className="text-muted">
            View highlights from social, charitable, spiritual, and medical service activities.
          </p>
        </div>

        <div className="sdhs-gallery-filters mb-5">
          {categories.map((category) => (
            <button
              key={category}
              className={selectedCategory === category ? 'active' : ''}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="row g-4">
          {filteredItems.map((item, index) => (
            <div
              className="col-md-6 col-lg-4"
              key={`${item.imageId || item.title}-${index}`}
              data-aos="fade-up"
            >
              <div className="sdhs-gallery-card">
                {item.image ? (
                  <img src={item.image} alt={item.title} />
                ) : (
                  <div className="sdhs-gallery-placeholder d-flex align-items-center justify-content-center">
                    <span>{item.title}</span>
                  </div>
                )}

                <div className="sdhs-gallery-overlay">
                  <span>{item.category}</span>
                  <h4>{item.title}</h4>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Gallery;