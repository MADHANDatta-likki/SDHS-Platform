import { useEffect, useState } from 'react';
import api from '../services/api';

type ServiceSection = {
  serviceId: number;
  serviceName: string;
  serviceKey: string;
  displayOrder: number;
};

type SiteImage = {
  imageId: number;
  title?: string;
  description?: string;
  imageUrl: string;
};

type ServiceCard = {
  serviceId?: number;
  serviceKey: string;
  title: string;
  icon: string;
  text: string;
  imageUrl?: string;
};

const fallbackServices: ServiceCard[] = [
  {
    serviceKey: 'SOCIAL_SERVICE',
    title: 'Social Services',
    icon: 'bi-people-fill',
    text: 'Community-focused service activities supporting people in need.',
  },
  {
    serviceKey: 'CHARITABLE_SERVICE',
    title: 'Charitable Services',
    icon: 'bi-heart-fill',
    text: 'Providing material, financial, and volunteer support to needy communities.',
  },
  {
    serviceKey: 'MEDICAL_SERVICE',
    title: 'Medical Services',
    icon: 'bi-hospital-fill',
    text: 'Medical camps, health support, and care programs for local and remote communities.',
  },
  {
    serviceKey: 'SPIRITUAL_SERVICE',
    title: 'Spiritual Service',
    icon: 'bi-brightness-high-fill',
    text: 'Supporting spiritual events, festivals, and service-oriented programs.',
  },
];

const serviceIconMap: Record<string, string> = {
  SOCIAL_SERVICE: 'bi-people-fill',
  CHARITABLE_SERVICE: 'bi-heart-fill',
  MEDICAL_SERVICE: 'bi-hospital-fill',
  SPIRITUAL_SERVICE: 'bi-brightness-high-fill',
  COMMUNITY_SUPPORT: 'bi-hands-helping',
  AWARDS: 'bi-award-fill',
};

const serviceTextMap: Record<string, string> = {
  SOCIAL_SERVICE: 'Community-focused service activities supporting people in need.',
  CHARITABLE_SERVICE: 'Providing material, financial, and volunteer support to needy communities.',
  MEDICAL_SERVICE: 'Medical camps, health support, and care programs for local and remote communities.',
  SPIRITUAL_SERVICE: 'Supporting spiritual events, festivals, and service-oriented programs.',
  COMMUNITY_SUPPORT: 'Volunteer-led support programs for families, communities, and service activities.',
  AWARDS: 'Recognizing service, dedication, and contributions of SDHS volunteers.',
};

function Services() {
  const [services, setServices] = useState<ServiceCard[]>(fallbackServices);

  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    try {
      const serviceResponse = await api.get('/service-sections');
      const serviceSections: ServiceSection[] = Array.isArray(serviceResponse.data)
        ? serviceResponse.data
        : [];

      if (serviceSections.length === 0) {
        setServices(fallbackServices);
        return;
      }

      const cards = await Promise.all(
        serviceSections.map(async (section) => {
          let imageUrl = '';

          try {
            const imageResponse = await api.get(`/images/placement/${section.serviceKey}`);
            const images: SiteImage[] = Array.isArray(imageResponse.data)
              ? imageResponse.data
              : [];

            imageUrl = images[0]?.imageUrl || '';
          } catch (error) {
            console.error(`Error loading image for ${section.serviceKey}:`, error);
          }

          return {
            serviceId: section.serviceId,
            serviceKey: section.serviceKey,
            title: section.serviceName,
            icon: serviceIconMap[section.serviceKey] || 'bi-grid-fill',
            text: serviceTextMap[section.serviceKey] || 'SDHS service activity.',
            imageUrl,
          };
        })
      );

      setServices(cards);
    } catch (error) {
      console.error('Error loading services:', error);
      setServices(fallbackServices);
    }
  };

  const handleServiceClick = (service: ServiceCard) => {
    const gallerySection = document.getElementById('gallery');

    if (gallerySection) {
      gallerySection.scrollIntoView({ behavior: 'smooth' });
    }
  };

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
            <div className="col-md-6 col-lg-4" key={service.serviceKey} data-aos="fade-up">
              <button
                type="button"
                className="sdhs-service-card h-100 w-100 text-start border-0"
                onClick={() => handleServiceClick(service)}
              >
                {service.imageUrl && (
                  <div className="sdhs-service-image mb-3">
                    <img
                      src={service.imageUrl}
                      alt={service.title}
                      className="img-fluid rounded"
                    />
                  </div>
                )}

                {!service.imageUrl && (
                  <div className="sdhs-service-icon">
                    <i className={`bi ${service.icon}`}></i>
                  </div>
                )}

                <h4>{service.title}</h4>
                <p>{service.text}</p>
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Services;