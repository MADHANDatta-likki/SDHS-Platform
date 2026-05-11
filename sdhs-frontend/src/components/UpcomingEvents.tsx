import { useEffect, useState } from 'react';
import api from '../services/api';

type EventItem = {
  eventId: number;
  eventName: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  imageUrl?: string;
};

type SiteImage = {
  imageId: number;
  title?: string;
  description?: string;
  imageUrl: string;
};

const fallbackEvents: EventItem[] = [
  {
    eventId: 1,
    eventName: 'Volunteer Camp',
    location: 'SDHS Campus',
    startDate: '2026-01-01',
    endDate: '2026-01-03',
  },
];

function UpcomingEvents() {
  const [events, setEvents] = useState<EventItem[]>(fallbackEvents);

  useEffect(() => {
    loadEvents();
  }, []);

  const formatDateRange = (start?: string, end?: string) => {
    if (!start) return 'Upcoming Event';

    const startDate = new Date(start).toLocaleDateString();

    if (!end) {
      return startDate;
    }

    const endDate = new Date(end).toLocaleDateString();

    return `${startDate} - ${endDate}`;
  };

  const loadEvents = async () => {
    try {
      const response = await api.get('/events/active');

      const eventData: EventItem[] = Array.isArray(response.data)
        ? response.data
        : [];

      if (eventData.length === 0) {
        setEvents(fallbackEvents);
        return;
      }

      const enrichedEvents = await Promise.all(
        eventData.map(async (event) => {
          let imageUrl = '';

          try {
            const imageResponse = await api.get('/images/placement/EVENT_CARD');

            const images: SiteImage[] = Array.isArray(imageResponse.data)
              ? imageResponse.data
              : [];

            const matchingImage = images.find(
              image =>
                image.title?.toLowerCase().includes(event.eventName.toLowerCase())
            );

            imageUrl = matchingImage?.imageUrl || images[0]?.imageUrl || '';
          } catch (error) {
            console.error('Event image load error:', error);
          }

          return {
            ...event,
            imageUrl,
          };
        })
      );

      setEvents(enrichedEvents);
    } catch (error) {
      console.error('Error loading events:', error);
      setEvents(fallbackEvents);
    }
  };

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
            <div
              className="col-md-6 col-lg-4"
              key={event.eventId}
              data-aos="zoom-in"
            >
              <div className="sdhs-event-card h-100">
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt={event.eventName} />
                ) : (
                  <div className="sdhs-gallery-placeholder d-flex align-items-center justify-content-center">
                    <span>{event.eventName}</span>
                  </div>
                )}

                <div className="p-4">
                  <p className="sdhs-event-date">
                    {formatDateRange(event.startDate, event.endDate)}
                  </p>

                  <h4>{event.eventName}</h4>

                  <p className="text-muted mb-3">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    {event.location || 'SDHS'}
                  </p>

                  <a href="/register" className="btn btn-outline-primary btn-sm">
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