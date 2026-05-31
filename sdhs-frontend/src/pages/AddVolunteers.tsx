import { useState } from 'react';
import api from '../services/api';
import { useParams } from 'react-router-dom';

function AddVolunteers() {
  const { registrationId } = useParams();

  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [error, setError] = useState('');

  const addRow = () => {
    setVolunteers([
      ...volunteers,
      { volunteerId: '', name: '', age: '', relationship: '' },
    ]);
  };

  const removeRow = (indexToRemove: number) => {
    setVolunteers(volunteers.filter((_, index) => index !== indexToRemove));
  };

  const lookupVolunteer = async (index: number, volunteerId: string) => {
    const cleanedVolunteerId = volunteerId.trim().toUpperCase();

    if (!cleanedVolunteerId) {
      return;
    }

    try {
      setError('');

      const response = await api.get(`/volunteers/${cleanedVolunteerId}`);
      const volunteer = response.data;

      const updated = [...volunteers];
      updated[index] = {
        ...updated[index],
        volunteerId: cleanedVolunteerId,
        name: volunteer.displayName || volunteer.fullName || '',
        age: volunteer.age || updated[index].age || '',
      };

      setVolunteers(updated);
    } catch (err: any) {
      console.error('Volunteer lookup error:', err);

      const updated = [...volunteers];
      updated[index] = {
        ...updated[index],
        volunteerId: cleanedVolunteerId,
        name: '',
      };

      setVolunteers(updated);
      setError(`Volunteer ID ${cleanedVolunteerId} was not found in SDHS records.`);
    }
  };

  const handleSubmit = async () => {
  try {
    setError('');

    if (volunteers.length === 0) {
      setError('Please add at least one volunteer');
      return;
    }

    for (let v of volunteers) {
      if (
        !v.volunteerId.trim() ||
        !v.name.trim() ||
        !String(v.age).trim()
      ) {
        setError('Volunteer ID, Full Name, and Age are required for each volunteer. Relationship is optional.');
        return;
      }
    }

    const ids = volunteers.map((v) => v.volunteerId.trim().toUpperCase());
    const uniqueIds = new Set(ids);

    if (ids.length !== uniqueIds.size) {
      setError('Duplicate Volunteer IDs found');
      return;
    }

    const payload = {
      participants: volunteers.map((v) => ({
        volunteerId: v.volunteerId.trim().toUpperCase(),
        fullName: v.name.trim(),
        age: Number(v.age),
        relationship: v.relationship?.trim() || '',
      })),
      payment: null,
    };

    await api.post(`/registrations/${registrationId}/add-volunteers`, payload);

    alert('Volunteers submitted successfully and pending organizer review.');
    window.location.href = '/volunteer/registrations';
  } catch (err: any) {
    console.error('Add volunteers error:', err);

    const backendMessage =
      typeof err.response?.data === 'string'
        ? err.response.data
        : err.response?.data?.message || '';

    if (
      backendMessage.includes('already registered') ||
      backendMessage.includes('uq_event_volunteer_participant') ||
      backendMessage.includes('duplicate key value')
    ) {
      setError('One or more selected volunteers are already registered for this event. Please remove duplicate volunteers and try again.');
      return;
    }

    setError('Failed to add volunteers. Please check details and try again.');
  }
};

  return (
    <main className="sdhs-dashboard-page">
      <div className="container py-5">
        <div className="sdhs-dashboard-header">
          <div>
            <p className="mb-1 text-muted">Volunteer Portal</p>
            <h1 className="fw-bold mb-0">Add Volunteers</h1>
          </div>

          <a href="/volunteer/registrations" className="btn btn-outline-primary">
            Back to Registrations
          </a>
        </div>

        <div className="sdhs-form mt-4">
          {error && <div className="alert alert-danger">{error}</div>}

          <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
            <div>
              <h5 className="fw-bold mb-1">Accompanying Volunteers</h5>
              <p className="text-muted mb-0">
                Add additional volunteers under this registration group.
              </p>
            </div>

            <button type="button" className="btn btn-outline-primary" onClick={addRow}>
              + Add Volunteer
            </button>
          </div>

          {volunteers.length === 0 && (
            <div className="alert alert-info">
              No volunteers added yet. Click <strong>+ Add Volunteer</strong> to begin.
            </div>
          )}

          {volunteers.map((volunteer, index) => (
            <div className="sdhs-accompanying-row" key={index}>
              <div className="row g-3 align-items-end">
                <div className="col-md-3">
                  <label className="form-label">Volunteer ID</label>
                  <input
                    className="form-control"
                    placeholder="VID"
                    value={volunteer.volunteerId}
                    onChange={(e) => {
                      const updated = [...volunteers];
                      updated[index].volunteerId = e.target.value;
                      updated[index].name = '';
                      setVolunteers(updated);
                    }}
                    onBlur={(e) => lookupVolunteer(index, e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Full Name</label>
                  <input
                    className="form-control"
                    placeholder="Full Name"
                    value={volunteer.name}
                    readOnly
                    onChange={(e) => {
                      const updated = [...volunteers];
                      updated[index].name = e.target.value;
                      setVolunteers(updated);
                    }}
                  />
                </div>

                <div className="col-md-2">
                  <label className="form-label">Age</label>
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Age"
                    value={volunteer.age}
                    onChange={(e) => {
                      const updated = [...volunteers];
                      updated[index].age = e.target.value;
                      setVolunteers(updated);
                    }}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Relationship <span className="text-muted">(optional)</span></label>
                  <input
                    className="form-control"
                    placeholder="Relationship"
                    value={volunteer.relationship}
                    onChange={(e) => {
                      const updated = [...volunteers];
                      updated[index].relationship = e.target.value;
                      setVolunteers(updated);
                    }}
                  />
                </div>

                <div className="col-md-1">
                  <button
                    type="button"
                    className="btn btn-outline-danger w-100"
                    onClick={() => removeRow(index)}
                  >
                    <i className="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}

          <div className="mt-4">
            <button
              type="button"
              className="btn btn-success me-2"
              onClick={handleSubmit}
              disabled={volunteers.length === 0}
            >
              Submit for Review
            </button>

            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => (window.location.href = '/volunteer/registrations')}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

export default AddVolunteers;