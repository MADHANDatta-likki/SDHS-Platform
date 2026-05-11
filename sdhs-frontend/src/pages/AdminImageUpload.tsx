import { useEffect, useState } from 'react';
import api from '../services/api';
import { supabase } from '../services/supabase';

function AdminImageUpload() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const uploadedBy =
  localStorage.getItem('volunteerId') || 'SYSTEM';

  const [serviceSections, setServiceSections] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);

  const [homeHero, setHomeHero] = useState(false);
  const [gallery, setGallery] = useState(false);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [selectedEvent, setSelectedEvent] = useState('');
  const [saving, setSaving] = useState(false);
const [successMessage, setSuccessMessage] = useState('');
const [errorMessage, setErrorMessage] = useState('');
const [uploading, setUploading] = useState(false);

  useEffect(() => {
    loadServiceSections();
    loadEvents();
  }, []);

  const loadServiceSections = async () => {
  try {
    const response = await api.get('/service-sections');
    console.log('Service sections:', response.data);

    if (Array.isArray(response.data)) {
      setServiceSections(response.data);
    } else {
      setServiceSections([]);
    }
  } catch (err) {
    console.error('Service sections error:', err);
    setServiceSections([]);
  }
};

  const loadEvents = async () => {
  try {
    const response = await api.get('/events/active');
    console.log('Events:', response.data);

    if (Array.isArray(response.data)) {
      setEvents(response.data);
    } else {
      setEvents([]);
    }
  } catch (err) {
    console.error('Events error:', err);
    setEvents([]);
  }
};

  const toggleService = (serviceId: number) => {
    if (selectedServices.includes(serviceId)) {
      setSelectedServices(selectedServices.filter(id => id !== serviceId));
    } else {
      setSelectedServices([...selectedServices, serviceId]);
    }
  };

  const handleFileUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {

  const file = e.target.files?.[0];

  if (!file) return;

  try {

    setUploading(true);
    setErrorMessage('');

    const safeFileName = file.name
  .toLowerCase()
  .replace(/[^a-z0-9.]/g, '-')
  .replace(/-+/g, '-');

const fileName = `${Date.now()}-${safeFileName}`;
const filePath = `gallery/${fileName}`;

    const { error } = await supabase.storage
      .from('sdhs-public-assets')
      .upload(filePath, file);

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from('sdhs-public-assets')
      .getPublicUrl(filePath);

    setImageUrl(data.publicUrl);

  } catch (err) {

    console.error(err);
    setErrorMessage('Failed to upload image');

  } finally {

    setUploading(false);
  }
};

  const handleSubmit = async () => {

    setSuccessMessage('');
setErrorMessage('');

if (!title.trim()) {
  setErrorMessage('Title is required');
  return;
}

if (!imageUrl.trim()) {
  setErrorMessage('Image URL is required');
  return;
}

setSaving(true);

    const placements: any[] = [];

    if (homeHero) {
      placements.push({
        placementArea: 'HOME',
        placementKey: 'HOME_HERO',
        relatedEntityType: null,
        relatedEntityId: null,
        displayOrder: 1
      });
    }

    if (gallery) {
      placements.push({
        placementArea: 'GALLERY',
        placementKey: 'GALLERY',
        relatedEntityType: null,
        relatedEntityId: null,
        displayOrder: 1
      });
    }

    selectedServices.forEach(serviceId => {
      const selectedService = serviceSections.find(
        service => service.serviceId === serviceId
      );

      placements.push({
        placementArea: 'SERVICE',
        placementKey: selectedService?.serviceKey || 'SERVICE_SECTION',
        relatedEntityType: 'SERVICE',
        relatedEntityId: serviceId,
        displayOrder: 1
      });
    });

    if (selectedEvent) {
      placements.push({
        placementArea: 'EVENT',
        placementKey: 'EVENT_CARD',
        relatedEntityType: 'EVENT',
        relatedEntityId: Number(selectedEvent),
        displayOrder: 1
      });
    }

    const payload = {
      title,
      description,
      imageUrl,
      storagePath: imageUrl,
      uploadedBy,
      placements
    };

    try {

  await api.post('/admin/images', payload);

  setSuccessMessage('Image saved successfully');

  setTitle('');
  setDescription('');
  setImageUrl('');
  setHomeHero(false);
  setGallery(false);
  setSelectedServices([]);
  setSelectedEvent('');

} catch (err) {

  console.error(err);
  setErrorMessage('Failed to save image');

} finally {

  setSaving(false);
}
  };

  return (
    <main className="container py-5">

      <h2 className="mb-4">Admin Image Upload</h2>

      <div className="card p-4">

        <div className="mb-3">
          <label className="form-label">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Description</label>
          <textarea
            className="form-control"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="form-label">Supabase Image URL</label>
          <div className="mb-4">

  <label className="form-label fw-bold">
    Upload Image
  </label>

  <input
    type="file"
    className="form-control"
    accept="image/*"
    onChange={handleFileUpload}
  />

  {uploading && (
    <small className="text-primary">
      Uploading image...
    </small>
  )}

</div>
          <input
            className="form-control"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />
          {imageUrl && (
  <div className="mb-4">

    <label className="form-label fw-bold">
      Image Preview
    </label>

    <div className="border rounded p-2">

      <img
        src={imageUrl}
        alt="preview"
        className="img-fluid rounded"
        style={{
          maxHeight: '300px',
          objectFit: 'cover'
        }}
      />

    </div>
  </div>
)}
        </div>

        <h5>Display Options</h5>

        <div className="form-check">
          <input
            type="checkbox"
            className="form-check-input"
            checked={homeHero}
            onChange={(e) => setHomeHero(e.target.checked)}
          />
          <label className="form-check-label">
            Home Hero
          </label>
        </div>

        <div className="form-check mb-4">
          <input
            type="checkbox"
            className="form-check-input"
            checked={gallery}
            onChange={(e) => setGallery(e.target.checked)}
          />
          <label className="form-check-label">
            Gallery
          </label>
        </div>

        <h5>Services</h5>

        {serviceSections.map(service => (
          <div className="form-check" key={service.serviceId}>
            <input
              type="checkbox"
              className="form-check-input"
              checked={selectedServices.includes(service.serviceId)}
              onChange={() => toggleService(service.serviceId)}
            />
            <label className="form-check-label">
              {service.serviceName}
            </label>
          </div>
        ))}

        <div className="mt-4">
          <h5>Event</h5>

          <select
            className="form-select"
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
          >
            <option value="">Select Event</option>

            {events.map((event: any) => (
              <option key={event.eventId} value={event.eventId}>
                {event.eventName}
              </option>
            ))}
          </select>
        </div>
{successMessage && (
  <div className="alert alert-success">
    {successMessage}
  </div>
)}

{errorMessage && (
  <div className="alert alert-danger">
    {errorMessage}
  </div>
)}
        <button
  className="btn btn-primary mt-4"
  onClick={handleSubmit}
  disabled={saving}
>
  {saving ? 'Saving...' : 'Save Image'}
</button>

      </div>
    </main>
  );
}

export default AdminImageUpload;