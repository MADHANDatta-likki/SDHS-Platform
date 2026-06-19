import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';
import {
  buildStoragePath,
  extractStoragePathFromPublicUrl,
  STORAGE_BUCKET,
} from '../services/storageConfig';
import { supabase } from '../services/supabase';

type ImagePlacement = {
  placementId: number;
  placementArea: string;
  placementKey: string;
  relatedEntityType?: string | null;
  relatedEntityId?: number | null;
  displayOrder: number;
  active: boolean;
};

type ManagedImage = {
  imageId: number;
  title: string;
  description?: string;
  imageUrl: string;
  storagePath?: string;
  uploadedBy?: string;
  active: boolean;
  placements: ImagePlacement[];
};

type ServiceSection = {
  serviceId: number;
  serviceName: string;
  serviceKey: string;
};

type EventItem = {
  eventId: number;
  eventName: string;
};

type PlacementDraft = {
  placementArea: string;
  placementKey: string;
  relatedEntityType: string;
  relatedEntityId: string;
  displayOrder: string;
  active: boolean;
};

type UploadForm = {
  title: string;
  description: string;
  imageUrl: string;
  placementType: string;
  serviceId: string;
  eventId: string;
  displayOrder: string;
};

type AssignForm = {
  imageId: string;
  placementType: string;
  serviceId: string;
  eventId: string;
  displayOrder: string;
};

const emptyUploadForm: UploadForm = {
  title: '',
  description: '',
  imageUrl: '',
  placementType: 'HOME_HERO',
  serviceId: '',
  eventId: '',
  displayOrder: '1',
};

const emptyAssignForm: AssignForm = {
  imageId: '',
  placementType: 'HOME_HERO',
  serviceId: '',
  eventId: '',
  displayOrder: '1',
};

const placementOptions = [
  { value: 'HOME_HERO', label: 'Home Hero Carousel' },
  { value: 'GALLERY', label: 'Gallery' },
  { value: 'SERVICE', label: 'Services' },
  { value: 'EVENT', label: 'Event Images' },
  { value: 'UNASSIGNED', label: 'Other / Unassigned' },
];

const getPlacementDraft = (
  placementType: string,
  serviceId: string,
  eventId: string,
  displayOrder: string,
  services: ServiceSection[]
) => {
  if (placementType === 'HOME_HERO') {
    return {
      placementArea: 'HOME',
      placementKey: 'HOME_HERO',
      relatedEntityType: '',
      relatedEntityId: '',
      displayOrder,
      active: true,
    };
  }

  if (placementType === 'GALLERY') {
    return {
      placementArea: 'GALLERY',
      placementKey: 'GALLERY',
      relatedEntityType: '',
      relatedEntityId: '',
      displayOrder,
      active: true,
    };
  }

  if (placementType === 'SERVICE') {
    const service = services.find((item) => String(item.serviceId) === serviceId);

    return {
      placementArea: 'SERVICE',
      placementKey: service?.serviceKey || 'SERVICE_SECTION',
      relatedEntityType: 'SERVICE',
      relatedEntityId: serviceId,
      displayOrder,
      active: true,
    };
  }

  if (placementType === 'EVENT') {
    return {
      placementArea: 'EVENT',
      placementKey: 'EVENT_CARD',
      relatedEntityType: 'EVENT',
      relatedEntityId: eventId,
      displayOrder,
      active: true,
    };
  }

  return null;
};

const getUsageLabel = (placement?: ImagePlacement | null) => {
  if (!placement) {
    return 'Not shown on public pages';
  }

  if (placement.placementKey === 'HOME_HERO') {
    return 'Shown on Home Hero';
  }

  if (placement.placementKey === 'GALLERY') {
    return 'Shown in Gallery';
  }

  if (placement.placementArea === 'SERVICE') {
    return 'Shown in Services';
  }

  if (placement.placementArea === 'EVENT') {
    return 'Shown on Event Cards';
  }

  return 'Shown on public website';
};

const getGroupKey = (placement?: ImagePlacement | null) => {
  if (!placement) return 'OTHER';
  if (placement.placementKey === 'HOME_HERO') return 'HOME_HERO';
  if (placement.placementKey === 'GALLERY') return 'GALLERY';
  if (placement.placementArea === 'SERVICE') return 'SERVICE';
  if (placement.placementArea === 'EVENT') return 'EVENT';
  return 'OTHER';
};

const buildPlacementPayload = (placement: PlacementDraft) => ({
  placementArea: placement.placementArea,
  placementKey: placement.placementKey,
  relatedEntityType: placement.relatedEntityType || null,
  relatedEntityId: placement.relatedEntityId ? Number(placement.relatedEntityId) : null,
  displayOrder: Number(placement.displayOrder || 0),
  active: placement.active,
});

const getAssignablePlacementDraft = (
  placementType: string,
  serviceId: string,
  eventId: string,
  displayOrder: string,
  services: ServiceSection[]
) => {
  if (placementType === 'UNASSIGNED') {
    return {
      placementArea: 'OTHER',
      placementKey: 'OTHER',
      relatedEntityType: '',
      relatedEntityId: '',
      displayOrder,
      active: true,
    };
  }

  return getPlacementDraft(placementType, serviceId, eventId, displayOrder, services);
};

function AdminImageUpload() {
  const [images, setImages] = useState<ManagedImage[]>([]);
  const [serviceSections, setServiceSections] = useState<ServiceSection[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [uploadForm, setUploadForm] = useState<UploadForm>(emptyUploadForm);
  const [assignForm, setAssignForm] = useState<AssignForm>(emptyAssignForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const uploadedBy =
    JSON.parse(localStorage.getItem('volunteer') || '{}')?.vid || 'SYSTEM';

  useEffect(() => {
    loadData();
  }, []);

  const getErrorMessage = (error: any) => {
    if (typeof error?.response?.data === 'string') {
      return error.response.data;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Image request could not be processed.';
  };

  const loadData = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const [imagesResponse, servicesResponse, eventsResponse] = await Promise.all([
        api.get('/admin/images'),
        api.get('/service-sections'),
        api.get('/events/active'),
      ]);

      setImages(Array.isArray(imagesResponse.data) ? imagesResponse.data : []);
      setServiceSections(Array.isArray(servicesResponse.data) ? servicesResponse.data : []);
      setEvents(Array.isArray(eventsResponse.data) ? eventsResponse.data : []);
    } catch (error) {
      console.error('Error loading image manager:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const updateUploadForm = (field: keyof UploadForm, value: string) => {
    setUploadForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'placementType' ? { serviceId: '', eventId: '' } : {}),
    }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const updateAssignForm = (field: keyof AssignForm, value: string) => {
    setAssignForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'placementType' ? { serviceId: '', eventId: '' } : {}),
    }));
    setSuccessMessage('');
    setErrorMessage('');
  };

  const uploadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setErrorMessage('');

      const safeFileName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');

      const filePath = buildStoragePath(
        'site-images',
        `${Date.now()}-${safeFileName}`
      );

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      updateUploadForm('imageUrl', data.publicUrl);
    } catch (error) {
      console.error('Image upload error:', error);
      setErrorMessage('Failed to upload image.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const buildPlacements = () => {
    const placement = getPlacementDraft(
      uploadForm.placementType,
      uploadForm.serviceId,
      uploadForm.eventId,
      uploadForm.displayOrder,
      serviceSections
    );

    if (!placement) {
      return [];
    }

    return [buildPlacementPayload(placement)];
  };

  const assignExistingImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!assignForm.imageId) {
      setErrorMessage('Please choose an image to assign.');
      return;
    }

    if (assignForm.placementType === 'SERVICE' && !assignForm.serviceId) {
      setErrorMessage('Please choose a service placement.');
      return;
    }

    if (assignForm.placementType === 'EVENT' && !assignForm.eventId) {
      setErrorMessage('Please choose an event placement.');
      return;
    }

    const placement = getAssignablePlacementDraft(
      assignForm.placementType,
      assignForm.serviceId,
      assignForm.eventId,
      assignForm.displayOrder,
      serviceSections
    );

    if (!placement) {
      setErrorMessage('Please choose a page or section placement.');
      return;
    }

    try {
      setSaving(true);
      await api.post(
        `/admin/images/${assignForm.imageId}/placements`,
        buildPlacementPayload(placement)
      );
      setAssignForm(emptyAssignForm);
      setSuccessMessage('Image assigned to section.');
      await loadData();
    } catch (error) {
      console.error('Error assigning image:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const saveNewImage = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (!uploadForm.title.trim()) {
      setErrorMessage('Title is required.');
      return;
    }

    if (!uploadForm.imageUrl.trim()) {
      setErrorMessage('Please upload an image first.');
      return;
    }

    if (uploadForm.placementType === 'SERVICE' && !uploadForm.serviceId) {
      setErrorMessage('Please choose a service placement.');
      return;
    }

    if (uploadForm.placementType === 'EVENT' && !uploadForm.eventId) {
      setErrorMessage('Please choose an event placement.');
      return;
    }

    try {
      setSaving(true);

      await api.post('/admin/images', {
        title: uploadForm.title.trim(),
        description: uploadForm.description.trim(),
        imageUrl: uploadForm.imageUrl,
        storagePath: uploadForm.imageUrl,
        uploadedBy,
        placements: buildPlacements(),
      });

      setUploadForm(emptyUploadForm);
      setSuccessMessage('Image saved successfully.');
      await loadData();
    } catch (error) {
      console.error('Error saving image:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const refreshWithMessage = async (message: string) => {
    setSuccessMessage(message);
    await loadData();
  };

  const groupedImages = useMemo(() => {
    const groups: Record<string, Array<{ image: ManagedImage; placement: ImagePlacement | null }>> = {
      HOME_HERO: [],
      GALLERY: [],
      SERVICE: [],
      EVENT: [],
      OTHER: [],
    };

    images.forEach((image) => {
      if (!image.placements || image.placements.length === 0) {
        groups.OTHER.push({ image, placement: null });
        return;
      }

      image.placements.forEach((placement) => {
        groups[getGroupKey(placement)].push({ image, placement });
      });
    });

    groups.HOME_HERO.sort(
      (a, b) => (a.placement?.displayOrder || 0) - (b.placement?.displayOrder || 0)
    );

    return groups;
  }, [images]);

  return (
    <AdminLayout
      title="Image Management"
      subtitle="Upload images, choose where they appear, and control public page order."
    >
      <div className="d-flex justify-content-end mt-4">
        <Link className="btn btn-outline-secondary" to="/admin/dashboard">
          Back to Dashboard
        </Link>
      </div>

      {successMessage && (
        <div className="alert alert-success mt-4">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="alert alert-danger mt-4">{errorMessage}</div>
      )}

      <section className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h4 className="fw-bold mb-3">Upload New Image</h4>

          <form onSubmit={saveNewImage}>
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label fw-semibold">Title</label>
                <input
                  className="form-control"
                  value={uploadForm.title}
                  onChange={(event) => updateUploadForm('title', event.target.value)}
                />
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Placement</label>
                <select
                  className="form-select"
                  value={uploadForm.placementType}
                  onChange={(event) => updateUploadForm('placementType', event.target.value)}
                >
                  {placementOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className="form-control"
                  rows={2}
                  value={uploadForm.description}
                  onChange={(event) => updateUploadForm('description', event.target.value)}
                />
              </div>

              {uploadForm.placementType === 'SERVICE' && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Service</label>
                  <select
                    className="form-select"
                    value={uploadForm.serviceId}
                    onChange={(event) => updateUploadForm('serviceId', event.target.value)}
                  >
                    <option value="">Select Service</option>
                    {serviceSections.map((service) => (
                      <option key={service.serviceId} value={service.serviceId}>
                        {service.serviceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {uploadForm.placementType === 'EVENT' && (
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Event</label>
                  <select
                    className="form-select"
                    value={uploadForm.eventId}
                    onChange={(event) => updateUploadForm('eventId', event.target.value)}
                  >
                    <option value="">Select Event</option>
                    {events.map((event) => (
                      <option key={event.eventId} value={event.eventId}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {uploadForm.placementType !== 'UNASSIGNED' && (
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Display Order</label>
                  <input
                    type="number"
                    className="form-control"
                    value={uploadForm.displayOrder}
                    onChange={(event) => updateUploadForm('displayOrder', event.target.value)}
                  />
                </div>
              )}

              <div className="col-md-6">
                <label className="form-label fw-semibold">Image File</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={uploadFile}
                  disabled={uploading}
                />
                {uploading && <small className="text-primary">Uploading image...</small>}
              </div>

              {uploadForm.imageUrl && (
                <div className="col-12">
                  <img
                    src={uploadForm.imageUrl}
                    alt="Preview"
                    className="img-fluid rounded border"
                    style={{ maxHeight: '220px', objectFit: 'cover' }}
                  />
                </div>
              )}
            </div>

            <details className="mt-3">
              <summary className="fw-semibold text-muted">Advanced image URL</summary>
              <input
                className="form-control mt-2"
                value={uploadForm.imageUrl}
                onChange={(event) => updateUploadForm('imageUrl', event.target.value)}
              />
            </details>

            <button
              className="btn btn-primary mt-4"
              type="submit"
              disabled={saving || uploading}
            >
              {saving ? 'Saving...' : 'Save Image'}
            </button>
          </form>
        </div>
      </section>

      <section className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <h4 className="fw-bold mb-3">Assign Existing Image to Page/Section</h4>

          <form onSubmit={assignExistingImage}>
            <div className="row g-3 align-items-end">
              <div className="col-md-4">
                <label className="form-label fw-semibold">Existing Image</label>
                <select
                  className="form-select"
                  value={assignForm.imageId}
                  onChange={(event) => updateAssignForm('imageId', event.target.value)}
                >
                  <option value="">Select Image</option>
                  {images.map((image) => (
                    <option key={image.imageId} value={image.imageId}>
                      {image.title || `Image #${image.imageId}`}
                    </option>
                  ))}
                </select>
              </div>

              <div className="col-md-3">
                <label className="form-label fw-semibold">Placement</label>
                <select
                  className="form-select"
                  value={assignForm.placementType}
                  onChange={(event) => updateAssignForm('placementType', event.target.value)}
                >
                  {placementOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {assignForm.placementType === 'SERVICE' && (
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Service</label>
                  <select
                    className="form-select"
                    value={assignForm.serviceId}
                    onChange={(event) => updateAssignForm('serviceId', event.target.value)}
                  >
                    <option value="">Select Service</option>
                    {serviceSections.map((service) => (
                      <option key={service.serviceId} value={service.serviceId}>
                        {service.serviceName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {assignForm.placementType === 'EVENT' && (
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Event</label>
                  <select
                    className="form-select"
                    value={assignForm.eventId}
                    onChange={(event) => updateAssignForm('eventId', event.target.value)}
                  >
                    <option value="">Select Event</option>
                    {events.map((event) => (
                      <option key={event.eventId} value={event.eventId}>
                        {event.eventName}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="col-md-2">
                <label className="form-label fw-semibold">Display Order</label>
                <input
                  type="number"
                  className="form-control"
                  value={assignForm.displayOrder}
                  onChange={(event) => updateAssignForm('displayOrder', event.target.value)}
                />
              </div>

              <div className="col-md-2">
                <button className="btn btn-primary w-100" type="submit" disabled={saving}>
                  Assign
                </button>
              </div>
            </div>
          </form>
        </div>
      </section>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" />
        </div>
      ) : (
        <>
          <ImageGroup
            title="Home Hero Carousel"
            emptyMessage="No hero images yet"
            items={groupedImages.HOME_HERO}
            services={serviceSections}
            events={events}
            onRefresh={refreshWithMessage}
          />

          <ImageGroup
            title="Gallery"
            emptyMessage="No gallery images yet"
            items={groupedImages.GALLERY}
            services={serviceSections}
            events={events}
            onRefresh={refreshWithMessage}
          />

          <ImageGroup
            title="Services"
            emptyMessage="No service images yet"
            items={groupedImages.SERVICE}
            services={serviceSections}
            events={events}
            onRefresh={refreshWithMessage}
          />

          <ImageGroup
            title="Event Images"
            emptyMessage="No event images yet"
            items={groupedImages.EVENT}
            services={serviceSections}
            events={events}
            onRefresh={refreshWithMessage}
          />

          <ImageGroup
            title="Other / Unassigned"
            emptyMessage="No unassigned images"
            items={groupedImages.OTHER}
            services={serviceSections}
            events={events}
            onRefresh={refreshWithMessage}
          />
        </>
      )}
    </AdminLayout>
  );
}

type ImageGroupProps = {
  title: string;
  emptyMessage: string;
  items: Array<{ image: ManagedImage; placement: ImagePlacement | null }>;
  services: ServiceSection[];
  events: EventItem[];
  onRefresh: (message: string) => Promise<void>;
};

function ImageGroup({
  title,
  emptyMessage,
  items,
  services,
  events,
  onRefresh,
}: ImageGroupProps) {
  return (
    <section className="mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 className="fw-bold mb-0">{title}</h4>
        <span className="badge bg-light text-dark border">{items.length}</span>
      </div>

      {items.length === 0 ? (
        <div className="alert alert-info">{emptyMessage}</div>
      ) : (
        <div className="row g-4">
          {items.map(({ image, placement }) => (
            <div
              className="col-md-6 col-xl-4"
              key={`${image.imageId}-${placement?.placementId || 'unassigned'}`}
            >
              <ImageManagerCard
                image={image}
                placement={placement}
                services={services}
                events={events}
                onRefresh={onRefresh}
              />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

type ImageManagerCardProps = {
  image: ManagedImage;
  placement: ImagePlacement | null;
  services: ServiceSection[];
  events: EventItem[];
  onRefresh: (message: string) => Promise<void>;
};

function ImageManagerCard({
  image,
  placement,
  services,
  events,
  onRefresh,
}: ImageManagerCardProps) {
  const [title, setTitle] = useState(image.title || '');
  const [description, setDescription] = useState(image.description || '');
  const [imageActive, setImageActive] = useState(Boolean(image.active));
  const [saving, setSaving] = useState(false);
  const [showAddPlacement, setShowAddPlacement] = useState(false);
  const [addPlacementDraft, setAddPlacementDraft] = useState<PlacementDraft>({
    placementArea: 'HOME',
    placementKey: 'HOME_HERO',
    relatedEntityType: '',
    relatedEntityId: '',
    displayOrder: '1',
    active: true,
  });
  const [placementDraft, setPlacementDraft] = useState<PlacementDraft>(() =>
    placement
      ? {
          placementArea: placement.placementArea,
          placementKey: placement.placementKey,
          relatedEntityType: placement.relatedEntityType || '',
          relatedEntityId: placement.relatedEntityId ? String(placement.relatedEntityId) : '',
          displayOrder: String(placement.displayOrder ?? 0),
          active: Boolean(placement.active),
        }
      : {
          placementArea: 'HOME',
          placementKey: 'HOME_HERO',
          relatedEntityType: '',
          relatedEntityId: '',
          displayOrder: '1',
          active: true,
        }
  );

  const getErrorMessage = (error: any) => {
    if (typeof error?.response?.data === 'string') {
      return error.response.data;
    }

    return 'Image request could not be processed.';
  };

  const saveMetadata = async () => {
    try {
      setSaving(true);
      await api.put(`/admin/images/${image.imageId}`, {
        title,
        description,
        active: imageActive,
      });
      await onRefresh('Image details updated.');
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const savePlacement = async () => {
    try {
      setSaving(true);
      const payload = {
        ...buildPlacementPayload(placementDraft),
      };

      if (placement) {
        await api.patch(`/admin/images/placements/${placement.placementId}`, payload);
      } else {
        await api.post(`/admin/images/${image.imageId}/placements`, payload);
      }

      await onRefresh(placement ? 'Placement updated.' : 'Image assigned to section.');
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const saveAdditionalPlacement = async () => {
    try {
      setSaving(true);
      await api.post(
        `/admin/images/${image.imageId}/placements`,
        buildPlacementPayload(addPlacementDraft)
      );
      setShowAddPlacement(false);
      setAddPlacementDraft({
        placementArea: 'HOME',
        placementKey: 'HOME_HERO',
        relatedEntityType: '',
        relatedEntityId: '',
        displayOrder: '1',
        active: true,
      });
      await onRefresh('Image assigned to section.');
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const removePlacementById = async (placementId: number) => {
    if (!window.confirm('Remove this image from this section?')) {
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/admin/images/placements/${placementId}`);
      await onRefresh('Removed from section.');
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const removePlacement = async () => {
    if (!placement) return;
    await removePlacementById(placement.placementId);
  };

  const deleteImage = async () => {
    if (image.placements.length > 0) {
      alert('Remove all page placements before deleting this image.');
      return;
    }

    if (!window.confirm('Delete this unused image and its storage file?')) {
      return;
    }

    try {
      setSaving(true);
      const storagePath = extractStoragePathFromPublicUrl(image.imageUrl);

      if (!storagePath) {
        throw new Error('Unable to identify the Supabase storage file path for this image.');
      }

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .remove([storagePath]);

      if (error) {
        throw error;
      }

      await api.delete(`/admin/images/${image.imageId}`);
      await onRefresh('Image file deleted from storage.');
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const updateDisplayOrder = async (nextOrder: number) => {
    if (!placement) return;

    setPlacementDraft((current) => ({
      ...current,
      displayOrder: String(nextOrder),
    }));

    try {
      setSaving(true);
      await api.patch(`/admin/images/placements/${placement.placementId}`, {
        ...placementDraft,
        relatedEntityType: placementDraft.relatedEntityType || null,
        relatedEntityId: placementDraft.relatedEntityId
          ? Number(placementDraft.relatedEntityId)
          : null,
        displayOrder: nextOrder,
      });
      await onRefresh('Hero carousel order updated.');
    } catch (error) {
      alert(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const changePlacementType = (value: string) => {
    const draft = getPlacementDraft(value, '', '', placementDraft.displayOrder, services);

    if (draft) {
      setPlacementDraft(draft);
    }
  };

  const changeAddPlacementType = (value: string) => {
    const draft = getAssignablePlacementDraft(
      value,
      '',
      '',
      addPlacementDraft.displayOrder,
      services
    );

    if (draft) {
      setAddPlacementDraft(draft);
    }
  };

  const currentPlacementType = () => {
    if (placementDraft.placementKey === 'HOME_HERO') return 'HOME_HERO';
    if (placementDraft.placementKey === 'GALLERY') return 'GALLERY';
    if (placementDraft.placementArea === 'SERVICE') return 'SERVICE';
    if (placementDraft.placementArea === 'EVENT') return 'EVENT';
    return 'HOME_HERO';
  };

  const selectedServiceId =
    placementDraft.placementArea === 'SERVICE' ? placementDraft.relatedEntityId : '';
  const selectedEventId =
    placementDraft.placementArea === 'EVENT' ? placementDraft.relatedEntityId : '';
  const addPlacementType = () => {
    if (addPlacementDraft.placementKey === 'HOME_HERO') return 'HOME_HERO';
    if (addPlacementDraft.placementKey === 'GALLERY') return 'GALLERY';
    if (addPlacementDraft.placementArea === 'SERVICE') return 'SERVICE';
    if (addPlacementDraft.placementArea === 'EVENT') return 'EVENT';
    if (addPlacementDraft.placementArea === 'OTHER') return 'UNASSIGNED';
    return 'HOME_HERO';
  };

  return (
    <div className="card shadow-sm border-0 h-100">
      <img
        src={image.imageUrl}
        alt={image.title || 'SDHS image'}
        className="card-img-top"
        style={{ height: '190px', objectFit: 'cover' }}
      />

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
          <div>
            <span className="badge bg-primary-subtle text-primary border">
              {getUsageLabel(placement)}
            </span>
          </div>
          <span className={`badge ${image.active ? 'bg-success' : 'bg-secondary'}`}>
            {image.active ? 'Image Active' : 'Image Inactive'}
          </span>
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Title</label>
          <input
            className="form-control"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="mb-3">
          <label className="form-label fw-semibold">Description</label>
          <textarea
            className="form-control"
            rows={2}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="form-check form-switch mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            checked={imageActive}
            onChange={(event) => setImageActive(event.target.checked)}
            id={`image-active-${image.imageId}-${placement?.placementId || 'none'}`}
          />
          <label
            className="form-check-label"
            htmlFor={`image-active-${image.imageId}-${placement?.placementId || 'none'}`}
          >
            Image active
          </label>
        </div>

        <button
          className="btn btn-outline-primary btn-sm mb-3"
          onClick={saveMetadata}
          disabled={saving}
        >
          Save Image Details
        </button>

        <div className="border-top pt-3 mt-auto">
          <div className="mb-3">
            <h6 className="fw-bold mb-2">Current Placements</h6>

            {image.placements.length === 0 ? (
              <div className="text-muted small">This image is not assigned to any page.</div>
            ) : (
              <div className="d-flex flex-column gap-2">
                {image.placements.map((item) => (
                  <div
                    className="border rounded p-2 d-flex justify-content-between align-items-start gap-2"
                    key={item.placementId}
                  >
                    <div className="small">
                      <div className="fw-semibold">{getUsageLabel(item)}</div>
                      <div className="text-muted">
                        {item.placementArea} / {item.placementKey}
                      </div>
                      <div className="text-muted">
                        Order {item.displayOrder ?? 0} · {item.active ? 'Shown' : 'Hidden'}
                      </div>
                    </div>
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => removePlacementById(item.placementId)}
                      disabled={saving}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="d-flex justify-content-between align-items-center mb-2">
            <h6 className="fw-bold mb-0">Page Placement</h6>
            {placement && (
              <span className={`badge ${placement.active ? 'bg-success' : 'bg-secondary'}`}>
                {placement.active ? 'Shown' : 'Hidden'}
              </span>
            )}
          </div>

          <div className="small text-muted mb-2">
            {placement
              ? `${placement.placementArea} / ${placement.placementKey}`
              : 'Not currently used on a public page'}
          </div>

          <div className="row g-2">
            <div className="col-12">
              <label className="form-label small fw-semibold">Placement</label>
              <select
                className="form-select form-select-sm"
                value={currentPlacementType()}
                onChange={(event) => changePlacementType(event.target.value)}
              >
                {placementOptions
                  .filter((option) => option.value !== 'UNASSIGNED')
                  .map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
              </select>
            </div>

            {placementDraft.placementArea === 'SERVICE' && (
              <div className="col-12">
                <label className="form-label small fw-semibold">Service</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedServiceId}
                  onChange={(event) => {
                    const service = services.find(
                      (item) => String(item.serviceId) === event.target.value
                    );

                    setPlacementDraft((current) => ({
                      ...current,
                      placementKey: service?.serviceKey || 'SERVICE_SECTION',
                      relatedEntityType: 'SERVICE',
                      relatedEntityId: event.target.value,
                    }));
                  }}
                >
                  <option value="">Select Service</option>
                  {services.map((service) => (
                    <option key={service.serviceId} value={service.serviceId}>
                      {service.serviceName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {placementDraft.placementArea === 'EVENT' && (
              <div className="col-12">
                <label className="form-label small fw-semibold">Event</label>
                <select
                  className="form-select form-select-sm"
                  value={selectedEventId}
                  onChange={(event) =>
                    setPlacementDraft((current) => ({
                      ...current,
                      relatedEntityType: 'EVENT',
                      relatedEntityId: event.target.value,
                    }))
                  }
                >
                  <option value="">Select Event</option>
                  {events.map((event) => (
                    <option key={event.eventId} value={event.eventId}>
                      {event.eventName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="col-6">
              <label className="form-label small fw-semibold">Display Order</label>
              <input
                type="number"
                className="form-control form-control-sm"
                value={placementDraft.displayOrder}
                onChange={(event) =>
                  setPlacementDraft((current) => ({
                    ...current,
                    displayOrder: event.target.value,
                  }))
                }
              />
            </div>

            <div className="col-6 d-flex align-items-end">
              <div className="form-check form-switch">
                <input
                  className="form-check-input"
                  type="checkbox"
                  checked={placementDraft.active}
                  onChange={(event) =>
                    setPlacementDraft((current) => ({
                      ...current,
                      active: event.target.checked,
                    }))
                  }
                  id={`placement-active-${image.imageId}-${placement?.placementId || 'new'}`}
                />
                <label
                  className="form-check-label small"
                  htmlFor={`placement-active-${image.imageId}-${placement?.placementId || 'new'}`}
                >
                  Show
                </label>
              </div>
            </div>
          </div>

          {placementDraft.placementKey === 'HOME_HERO' && placement && (
            <div className="d-flex gap-2 mt-2">
              <button
                className="btn btn-outline-secondary btn-sm flex-fill"
                onClick={() => updateDisplayOrder(Number(placementDraft.displayOrder || 0) - 1)}
                disabled={saving}
              >
                Move Up
              </button>
              <button
                className="btn btn-outline-secondary btn-sm flex-fill"
                onClick={() => updateDisplayOrder(Number(placementDraft.displayOrder || 0) + 1)}
                disabled={saving}
              >
                Move Down
              </button>
            </div>
          )}

          <div className="d-flex flex-wrap gap-2 mt-3">
            <button
              className="btn btn-primary btn-sm"
              onClick={savePlacement}
              disabled={saving}
            >
              {placement ? 'Save Placement' : 'Add to Page'}
            </button>

            {placement && (
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={removePlacement}
                disabled={saving}
              >
                Remove from Page
              </button>
            )}

            {!placement && image.placements.length === 0 && (
              <button
                className="btn btn-danger btn-sm"
                onClick={deleteImage}
                disabled={saving}
              >
              Delete Metadata
              </button>
            )}
          </div>

          <div className="border-top pt-3 mt-3">
            <button
              className="btn btn-outline-primary btn-sm"
              onClick={() => setShowAddPlacement((current) => !current)}
              disabled={saving}
            >
              Add to another section
            </button>

            {showAddPlacement && (
              <div className="row g-2 mt-2">
                <div className="col-12">
                  <label className="form-label small fw-semibold">New Placement</label>
                  <select
                    className="form-select form-select-sm"
                    value={addPlacementType()}
                    onChange={(event) => changeAddPlacementType(event.target.value)}
                  >
                    {placementOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {addPlacementDraft.placementArea === 'SERVICE' && (
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Service</label>
                    <select
                      className="form-select form-select-sm"
                      value={addPlacementDraft.relatedEntityId}
                      onChange={(event) => {
                        const service = services.find(
                          (item) => String(item.serviceId) === event.target.value
                        );

                        setAddPlacementDraft((current) => ({
                          ...current,
                          placementKey: service?.serviceKey || 'SERVICE_SECTION',
                          relatedEntityType: 'SERVICE',
                          relatedEntityId: event.target.value,
                        }));
                      }}
                    >
                      <option value="">Select Service</option>
                      {services.map((service) => (
                        <option key={service.serviceId} value={service.serviceId}>
                          {service.serviceName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {addPlacementDraft.placementArea === 'EVENT' && (
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Event</label>
                    <select
                      className="form-select form-select-sm"
                      value={addPlacementDraft.relatedEntityId}
                      onChange={(event) =>
                        setAddPlacementDraft((current) => ({
                          ...current,
                          relatedEntityType: 'EVENT',
                          relatedEntityId: event.target.value,
                        }))
                      }
                    >
                      <option value="">Select Event</option>
                      {events.map((event) => (
                        <option key={event.eventId} value={event.eventId}>
                          {event.eventName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className="col-6">
                  <label className="form-label small fw-semibold">Display Order</label>
                  <input
                    type="number"
                    className="form-control form-control-sm"
                    value={addPlacementDraft.displayOrder}
                    onChange={(event) =>
                      setAddPlacementDraft((current) => ({
                        ...current,
                        displayOrder: event.target.value,
                      }))
                    }
                  />
                </div>

                <div className="col-6 d-flex align-items-end">
                  <div className="form-check form-switch">
                    <input
                      className="form-check-input"
                      type="checkbox"
                      checked={addPlacementDraft.active}
                      onChange={(event) =>
                        setAddPlacementDraft((current) => ({
                          ...current,
                          active: event.target.checked,
                        }))
                      }
                      id={`add-placement-active-${image.imageId}`}
                    />
                    <label
                      className="form-check-label small"
                      htmlFor={`add-placement-active-${image.imageId}`}
                    >
                      Show
                    </label>
                  </div>
                </div>

                <div className="col-12">
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={saveAdditionalPlacement}
                    disabled={saving}
                  >
                    Save New Placement
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <details className="mt-3">
          <summary className="small fw-semibold text-muted">Advanced details</summary>
          <div className="small text-break mt-2">
            <div><strong>Image ID:</strong> {image.imageId}</div>
            <div><strong>Placement ID:</strong> {placement?.placementId || '-'}</div>
            <div><strong>Supabase URL:</strong> {image.imageUrl}</div>
          </div>
        </details>
      </div>
    </div>
  );
}

export default AdminImageUpload;
