const heroSlides = [
  {
    image: '/assets/img/activities/image1.jpg',
    label: 'Social Service',
    title: 'Serving Humanity with Compassion',
    text: 'Join SDHS volunteers in community service programs that support people in need.',
  },
  {
    image: '/assets/img/activities/image2.jpg',
    label: 'Spiritual Service',
    title: 'Service is our Religion',
    text: 'Dedicated volunteers supporting spiritual events, seva programs, and community gatherings.',
  },
  {
    image: '/assets/img/activities/image3.jpg',
    label: 'Charitable Service',
    title: 'Together We Can Help More',
    text: 'Supporting charitable activities with love, discipline, devotion, and dedication.',
  },
];

function Hero() {
  return (
    <section id="home" className="sdhs-hero-carousel">
      <div
        id="sdhsHeroCarousel"
        className="carousel slide carousel-fade"
        data-bs-ride="carousel"
        data-bs-interval="4500"
      >
        <div className="carousel-indicators">
          {heroSlides.map((_, index) => (
            <button
              key={index}
              type="button"
              data-bs-target="#sdhsHeroCarousel"
              data-bs-slide-to={index}
              className={index === 0 ? 'active' : ''}
              aria-current={index === 0 ? 'true' : undefined}
              aria-label={`Slide ${index + 1}`}
            />
          ))}
        </div>

        <div className="carousel-inner">
          {heroSlides.map((slide, index) => (
            <div className={`carousel-item ${index === 0 ? 'active' : ''}`} key={slide.title}>
              <div
                className="sdhs-hero-slide"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                <div className="sdhs-hero-overlay"></div>

                <div className="container position-relative">
                  <div className="row min-vh-100 align-items-center">
                    <div className="col-lg-8 col-xl-7">
                      <span className="sdhs-hero-label">{slide.label}</span>
                      <h1>{slide.title}</h1>
                      <p>{slide.text}</p>

                      <div className="d-flex gap-3 mt-4 flex-wrap">
                        <a href="#join" className="btn btn-primary btn-lg">
                          Join as Volunteer
                        </a>
                        <a href="#services" className="btn btn-light btn-lg">
                          Explore Services
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          ))}
        </div>

        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#sdhsHeroCarousel"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Previous</span>
        </button>

        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#sdhsHeroCarousel"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon" aria-hidden="true"></span>
          <span className="visually-hidden">Next</span>
        </button>
      </div>
    </section>
  );
}

export default Hero;