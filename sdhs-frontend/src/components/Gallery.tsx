import { useState } from 'react';

const galleryItems = [
  { title: 'Awards', category: 'Awards', image: '/assets/img/portfolio/portfolio-1.jpg' },
  { title: 'Social Service', category: 'Social', image: '/assets/img/portfolio/portfolio-4.jpg' },
  { title: 'Charitable Service', category: 'Charitable', image: '/assets/img/portfolio/portfolio-7.jpg' },
  { title: 'Spiritual Service', category: 'Spiritual', image: '/assets/img/portfolio/portfolio-10.jpg' },
  { title: 'Medical Service', category: 'Medical', image: '/assets/img/portfolio/portfolio-13.jpg' },
  { title: 'Community Support', category: 'Social', image: '/assets/img/portfolio/portfolio-5.jpg' },
];

const categories = ['All', 'Awards', 'Social', 'Charitable', 'Spiritual', 'Medical'];

function Gallery() {
  const [selectedCategory, setSelectedCategory] = useState('All');

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
          {filteredItems.map((item) => (
            <div className="col-md-6 col-lg-4" key={`${item.title}-${item.image}`} data-aos="fade-up">
              <div className="sdhs-gallery-card">
                <img src={item.image} alt={item.title} />
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