const services = [
  {
    title: 'Social',
    icon: 'bi-people-fill',
    text: 'Community-focused service activities supporting people in need.',
  },
  {
    title: 'Charitable',
    icon: 'bi-heart-fill',
    text: 'Providing material, financial, and volunteer support to needy communities.',
  },
  {
    title: 'Medical',
    icon: 'bi-hospital-fill',
    text: 'Medical camps, health support, and care programs for local and remote communities.',
  },
  {
    title: 'Spiritual',
    icon: 'bi-brightness-high-fill',
    text: 'Supporting spiritual events, festivals, and service-oriented programs.',
  },
];

function Services() {
  return (
    <section id="services" className="section-padding bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <span className="sdhs-section-label">Our Services</span>
          <h2 className="fw-bold mt-2">Activities of SDHS</h2>
          <p className="text-muted">
            Social, charitable, medical, and spiritual service initiatives.
          </p>
        </div>

        <div className="row g-4">
          {services.map((service) => (
            <div className="col-md-6 col-lg-3" key={service.title} data-aos="fade-up">
              <div className="sdhs-service-card h-100">
                <div className="sdhs-service-icon">
                  <i className={`bi ${service.icon}`}></i>
                </div>
                <h4>{service.title}</h4>
                <p>{service.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;