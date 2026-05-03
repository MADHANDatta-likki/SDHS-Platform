const events = [
  {
    title: 'Chaturmasya Vrata Deeksha',
    location: 'Pithapuram',
    date: '10 July 2025 - 7 September 2025',
    image: '/assets/img/testimonials/testimonials-1.jpg',
  },
  {
    title: 'Devi Navarathri',
    location: 'Mysuru',
    date: '22 September 2025 - 2 October 2025',
    image: '/assets/img/testimonials/testimonials-2.jpg',
  },
  {
    title: "Pujya Swamiji's Music for Meditation & Bhagavad Gita Parayana",
    location: 'Vishakapatnam',
    date: '8 November 2025 - 9 November 2025',
    image: '/assets/img/testimonials/testimonials-3.jpg',
  },
];

function UpcomingEvents() {
  return (
    <section id="events" className="section-padding bg-light">
      <div className="container">
        <div className="text-center mb-5">
          <span className="sdhs-section-label">Upcoming Events</span>
          <h2 className="fw-bold mt-2">Participate in Upcoming Seva Activities</h2>
          <p className="text-muted">
            Explore upcoming SDHS programs and volunteer opportunities.
          </p>
        </div>

        <div className="row g-4">
          {events.map((event) => (
            <div className="col-md-6 col-lg-4" key={event.title} data-aos="zoom-in">
              <div className="sdhs-event-card h-100">
                <img src={event.image} alt={event.title} />
                <div className="p-4">
                  <p className="sdhs-event-date">{event.date}</p>
                  <h4>{event.title}</h4>
                  <p className="text-muted mb-3">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    {event.location}
                  </p>
                  <a href="#contact" className="btn btn-outline-primary btn-sm">
                    Volunteer for Event
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default UpcomingEvents;