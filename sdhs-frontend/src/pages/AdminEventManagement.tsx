import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';
import { supabase } from '../services/supabase';

type EventStatus = 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

type EventItem = {
  eventId: number;
  eventName: string;
  eventType?: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  registrationStartDate?: string;
  registrationEndDate?: string;
  paymentRequired?: boolean;
  amountPerVolunteer?: number | string;
  eventImageUrl?: string;
  eventStatus?: EventStatus;
  registrationOpen?: boolean;
  active?: boolean;
};

type EventFormState = Omit<EventItem, 'eventId'>;
type ValidationErrors = Partial<Record<keyof EventFormState, string>>;
type AlertType = 'success' | 'warning' | 'danger';

const emptyForm: EventFormState = {
  eventName: '',
  eventType: '',
  description: '',
  location: '',
  startDate: '',
  endDate: '',
  registrationStartDate: '',
  registrationEndDate: '',
  paymentRequired: true,
  amountPerVolunteer: '',
  eventImageUrl: '',
  eventStatus: 'ACTIVE',
  registrationOpen: true,
  active: true,
};

function AdminEventManagement() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [form, setForm] = useState<EventFormState>(emptyForm);
  const [editingEventId, setEditingEventId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [alert, setAlert] = useState<{ type: AlertType; message: string } | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});

  useEffect(() => {
    loadEvents();
  }, []);

  const sortedEvents = useMemo(() => {
    return [...events].sort((a, b) => {
      const aDate = a.startDate || '';
      const bDate = b.startDate || '';

      return bDate.localeCompare(aDate) || b.eventId - a.eventId;
    });
  }, [events]);

  const loadEvents = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/events');
      setEvents(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error loading admin events:', err);
      setAlert({ type: 'danger', message: getErrorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  const clearForm = () => {
    setForm(emptyForm);
    setEditingEventId(null);
    setValidationErrors({});
  };

  const resetForm = () => {
    clearForm();
    setAlert(null);
  };

  const getErrorMessage = (err: any) => {
    if (typeof err?.response?.data === 'string') {
      return err.response.data;
    }

    if (err?.response?.data?.message) {
      return err.response.data.message;
    }

    if (err?.response?.data?.error) {
      return err.response.data.error;
    }

    return 'An unexpected error occurred.';
  };

  const getFieldClass = (field: keyof EventFormState, baseClass = 'form-control') => (
    `${baseClass}${validationErrors[field] ? ' is-invalid' : ''}`
  );

  const renderInvalidFeedback = (field: keyof EventFormState) => (
    validationErrors[field] ? (
      <div className="invalid-feedback">{validationErrors[field]}</div>
    ) : null
  );

  const validateForm = () => {
    const errors: ValidationErrors = {};

    if (!form.eventName?.trim()) {
      errors.eventName = 'Event Name is required.';
    }

    if (!form.eventType?.trim()) {
      errors.eventType = 'Event Type is required.';
    }

    if (!form.description?.trim()) {
      errors.description = 'Description is required.';
    }

    if (!form.location?.trim()) {
      errors.location = 'Location is required.';
    }

    if (!form.startDate) {
      errors.startDate = 'Start Date is required.';
    }

    if (!form.endDate) {
      errors.endDate = 'End Date is required.';
    }

    if (!form.registrationStartDate) {
      errors.registrationStartDate = 'Registration Start Date is required.';
    }

    if (!form.registrationEndDate) {
      errors.registrationEndDate = 'Registration End Date is required.';
    }

    if (form.startDate && form.endDate && form.startDate > form.endDate) {
      errors.endDate = 'End Date must be after Start Date.';
    }

    if (
      form.registrationStartDate
      && form.registrationEndDate
      && form.registrationStartDate > form.registrationEndDate
    ) {
      errors.registrationEndDate = 'Registration End Date must be after Registration Start Date.';
    }

    if (
      form.registrationEndDate
      && form.endDate
      && form.registrationEndDate > form.endDate
    ) {
      errors.registrationEndDate = 'Registration End Date cannot be after Event End Date.';
    }

    if (form.paymentRequired && Number(form.amountPerVolunteer || 0) <= 0) {
      errors.amountPerVolunteer = 'Amount must be greater than zero.';
    }

    setValidationErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const editEvent = (event: EventItem) => {
    setEditingEventId(event.eventId);
    setForm({
      eventName: event.eventName || '',
      eventType: event.eventType || '',
      description: event.description || '',
      location: event.location || '',
      startDate: event.startDate || '',
      endDate: event.endDate || '',
      registrationStartDate: event.registrationStartDate || '',
      registrationEndDate: event.registrationEndDate || '',
      paymentRequired: event.paymentRequired ?? true,
      amountPerVolunteer: event.amountPerVolunteer ?? '',
      eventImageUrl: event.eventImageUrl || '',
      eventStatus: event.eventStatus || 'ACTIVE',
      registrationOpen: event.registrationOpen ?? true,
      active: event.active ?? true,
    });
    setAlert(null);
    setValidationErrors({});
  };

  const updateForm = (field: keyof EventFormState, value: string | boolean) => {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === 'paymentRequired' && value === false
        ? { amountPerVolunteer: 0 }
        : {}),
    }));
    setValidationErrors((current) => {
      if (!current[field] && field !== 'paymentRequired') {
        return current;
      }

      const next = { ...current };
      delete next[field];

      if (field === 'paymentRequired' && value === false) {
        delete next.amountPerVolunteer;
      }

      return next;
    });
  };

  const uploadEventImage = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploadingImage(true);
      setAlert(null);

      const safeFileName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');

      const filePath = `events/${Date.now()}-${safeFileName}`;

      const { error: uploadError } = await supabase.storage
        .from('sdhs-public-assets')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('sdhs-public-assets')
        .getPublicUrl(filePath);

      updateForm('eventImageUrl', data.publicUrl);
      setAlert({ type: 'success', message: 'Event image uploaded successfully.' });
    } catch (err) {
      console.error('Error uploading event image:', err);
      setAlert({ type: 'danger', message: getErrorMessage(err) });
    } finally {
      setUploadingImage(false);
      event.target.value = '';
    }
  };

  const buildPayload = () => ({
    ...form,
    startDate: form.startDate || null,
    endDate: form.endDate || null,
    registrationStartDate: form.registrationStartDate || null,
    registrationEndDate: form.registrationEndDate || null,
    amountPerVolunteer:
      form.paymentRequired
        ? Number(form.amountPerVolunteer || 0)
        : 0,
  });

  const saveEvent = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setAlert(null);

    if (!validateForm()) {
      return;
    }

    setSaving(true);

    try {
      if (editingEventId) {
        await api.put(`/admin/events/${editingEventId}`, buildPayload());
        setAlert({ type: 'success', message: 'Event updated successfully.' });
      } else {
        await api.post('/admin/events', buildPayload());
        setAlert({ type: 'success', message: 'Event created successfully.' });
      }

      clearForm();
      await loadEvents();
    } catch (err) {
      console.error('Error saving event:', err);
      setAlert({ type: 'danger', message: getErrorMessage(err) });
    } finally {
      setSaving(false);
    }
  };

  const completeEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to mark this event as completed?')) return;

    try {
      setAlert(null);
      await api.patch(`/admin/events/${eventId}/complete`);
      await loadEvents();
      setAlert({ type: 'success', message: 'Event marked as completed.' });
    } catch (err) {
      console.error('Error completing event:', err);
      setAlert({ type: 'danger', message: getErrorMessage(err) });
    }
  };

  const cancelEvent = async (eventId: number) => {
    if (!window.confirm('Are you sure you want to cancel this event?')) return;

    try {
      setAlert(null);
      await api.patch(`/admin/events/${eventId}/cancel`);
      await loadEvents();
      setAlert({ type: 'warning', message: 'Event cancelled successfully.' });
    } catch (err) {
      console.error('Error cancelling event:', err);
      setAlert({ type: 'danger', message: getErrorMessage(err) });
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-success';
      case 'CANCELLED':
        return 'bg-danger';
      default:
        return 'bg-primary';
    }
  };

  return (
    <AdminLayout
      title="Event Management"
      subtitle="Create events, edit details, and control event status."
    >
      <div className="d-flex justify-content-end mt-4">
        <Link className="btn btn-outline-secondary" to="/admin/dashboard">
          Back to Dashboard
        </Link>
      </div>

      <div className="row g-4 mt-1">
        <div className="col-12 col-xl-5">
          <form className="sdhs-form" onSubmit={saveEvent} noValidate>
            <div className="d-flex justify-content-between align-items-start gap-3 mb-3">
              <div>
                <h4 className="fw-bold mb-1">
                  {editingEventId ? 'Edit Event' : 'Create Event'}
                </h4>
                <p className="text-muted mb-0">
                  All event details can be changed later.
                </p>
              </div>

              {editingEventId && (
                <button
                  type="button"
                  className="btn btn-outline-secondary btn-sm"
                  onClick={resetForm}
                >
                  New
                </button>
              )}
            </div>

            {alert && (
              <div className={`alert alert-${alert.type}`}>{alert.message}</div>
            )}

            <div className="row g-3">
              <div className="col-12">
                <label className="form-label fw-semibold">Event Name</label>
                <input
                  className={getFieldClass('eventName')}
                  value={form.eventName}
                  onChange={(e) => updateForm('eventName', e.target.value)}
                />
                {renderInvalidFeedback('eventName')}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Event Type</label>
                <input
                  className={getFieldClass('eventType')}
                  value={form.eventType}
                  onChange={(e) => updateForm('eventType', e.target.value)}
                />
                {renderInvalidFeedback('eventType')}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Location</label>
                <input
                  className={getFieldClass('location')}
                  value={form.location}
                  onChange={(e) => updateForm('location', e.target.value)}
                />
                {renderInvalidFeedback('location')}
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Description</label>
                <textarea
                  className={getFieldClass('description')}
                  rows={3}
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                />
                {renderInvalidFeedback('description')}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Start Date</label>
                <input
                  type="date"
                  className={getFieldClass('startDate')}
                  value={form.startDate}
                  onChange={(e) => updateForm('startDate', e.target.value)}
                />
                {renderInvalidFeedback('startDate')}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">End Date</label>
                <input
                  type="date"
                  className={getFieldClass('endDate')}
                  value={form.endDate}
                  onChange={(e) => updateForm('endDate', e.target.value)}
                />
                {renderInvalidFeedback('endDate')}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Registration Start
                </label>
                <input
                  type="date"
                  className={getFieldClass('registrationStartDate')}
                  value={form.registrationStartDate}
                  onChange={(e) =>
                    updateForm('registrationStartDate', e.target.value)
                  }
                />
                {renderInvalidFeedback('registrationStartDate')}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">
                  Registration End
                </label>
                <input
                  type="date"
                  className={getFieldClass('registrationEndDate')}
                  value={form.registrationEndDate}
                  onChange={(e) =>
                    updateForm('registrationEndDate', e.target.value)
                  }
                />
                {renderInvalidFeedback('registrationEndDate')}
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Status</label>
                <select
                  className={getFieldClass('eventStatus', 'form-select')}
                  value={form.eventStatus}
                  onChange={(e) =>
                    updateForm('eventStatus', e.target.value as EventStatus)
                  }
                >
                  <option value="ACTIVE">Active</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>

              <div className="col-md-6">
                <label className="form-label fw-semibold">Amount</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className={getFieldClass('amountPerVolunteer')}
                  value={form.amountPerVolunteer}
                  onChange={(e) =>
                    updateForm('amountPerVolunteer', e.target.value)
                  }
                  disabled={!form.paymentRequired}
                />
                {renderInvalidFeedback('amountPerVolunteer')}
              </div>

              <div className="col-12">
                <label className="form-label fw-semibold">Event Image</label>
                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={uploadEventImage}
                  disabled={uploadingImage}
                />

                {uploadingImage && (
                  <small className="text-primary">Uploading event image...</small>
                )}

                {form.eventImageUrl && (
                  <div className="mt-3">
                    <img
                      src={form.eventImageUrl}
                      alt="Event preview"
                      className="img-fluid rounded border"
                      style={{ maxHeight: '220px', objectFit: 'cover' }}
                    />
                  </div>
                )}
              </div>

              <div className="col-12">
                <details>
                  <summary className="fw-semibold text-muted">
                    Use image URL instead
                  </summary>
                  <input
                    className="form-control mt-2"
                    value={form.eventImageUrl}
                    onChange={(e) => updateForm('eventImageUrl', e.target.value)}
                  />
                </details>
              </div>

              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={Boolean(form.paymentRequired)}
                    onChange={(e) =>
                      updateForm('paymentRequired', e.target.checked)
                    }
                    id="paymentRequired"
                  />
                  <label className="form-check-label" htmlFor="paymentRequired">
                    Payment Required
                  </label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={Boolean(form.registrationOpen)}
                    onChange={(e) =>
                      updateForm('registrationOpen', e.target.checked)
                    }
                    id="registrationOpen"
                  />
                  <label className="form-check-label" htmlFor="registrationOpen">
                    Registration Open
                  </label>
                </div>
              </div>

              <div className="col-md-4">
                <div className="form-check form-switch">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    checked={Boolean(form.active)}
                    onChange={(e) => updateForm('active', e.target.checked)}
                    id="active"
                  />
                  <label className="form-check-label" htmlFor="active">
                    Active
                  </label>
                </div>
              </div>

              <div className="col-12 d-flex gap-2">
                <button
                  className="btn btn-primary"
                  type="submit"
                  disabled={saving || uploadingImage}
                >
                  {saving && (
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      aria-hidden="true"
                    ></span>
                  )}
                  {saving ? 'Saving...' : editingEventId ? 'Update Event' : 'Create Event'}
                </button>
                <button
                  className="btn btn-outline-secondary"
                  type="button"
                  onClick={resetForm}
                >
                  Reset
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="col-12 col-xl-7">
          <div className="card shadow-sm border-0">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
                <h4 className="fw-bold mb-0">Events</h4>
                <button className="btn btn-outline-primary btn-sm" onClick={loadEvents}>
                  Refresh
                </button>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" />
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table align-middle table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Event</th>
                        <th>Dates</th>
                        <th>Registration</th>
                        <th>Payment</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sortedEvents.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-5">
                            <div className="text-muted mb-3">
                              No events found.
                            </div>
                            <Link className="btn btn-outline-secondary" to="/admin/dashboard">
                              Back to Dashboard
                            </Link>
                          </td>
                        </tr>
                      ) : (
                        sortedEvents.map((event) => (
                          <tr key={event.eventId}>
                            <td>
                              <div className="fw-semibold">{event.eventName}</div>
                              <div className="text-muted small">
                                {event.eventType || 'General'} · {event.location || 'SDHS'}
                              </div>
                            </td>
                            <td>
                              <div>{event.startDate || '-'}</div>
                              <div className="text-muted small">
                                to {event.endDate || '-'}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge ${
                                  event.registrationOpen
                                    ? 'bg-success'
                                    : 'bg-secondary'
                                }`}
                              >
                                {event.registrationOpen ? 'Open' : 'Closed'}
                              </span>
                            </td>
                            <td>
                              {event.paymentRequired ? (
                                <span className="badge bg-warning text-dark">
                                  ₹ {event.amountPerVolunteer || 0}
                                </span>
                              ) : (
                                <span className="badge bg-info text-dark">Free</span>
                              )}
                            </td>
                            <td>
                              <span
                                className={`badge ${getStatusBadgeClass(
                                  event.eventStatus
                                )}`}
                              >
                                {event.eventStatus || 'ACTIVE'}
                              </span>
                            </td>
                            <td>
                              <div className="d-flex flex-wrap gap-2">
                                <button
                                  className="btn btn-outline-primary btn-sm"
                                  onClick={() => editEvent(event)}
                                >
                                  Edit
                                </button>
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => completeEvent(event.eventId)}
                                  disabled={event.eventStatus === 'COMPLETED'}
                                >
                                  Complete
                                </button>
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => cancelEvent(event.eventId)}
                                  disabled={event.eventStatus === 'CANCELLED'}
                                >
                                  Cancel
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminEventManagement;
