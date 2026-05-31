import { useEffect, useState } from 'react';
import api from '../services/api';

type EventItem = {
  eventId: number;
  eventName: string;
  eventType: string;
  description?: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  feePerPerson?: number;
};

function EventRegistration() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [formError, setFormError] = useState('');
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);

  const volunteer = JSON.parse(localStorage.getItem('volunteer') || '{}');

  const [primary] = useState({
    firstName: volunteer?.name || volunteer?.displayName || '',
    lastName: volunteer?.surname || '',
    age: '',
    mobile: volunteer?.phone || volunteer?.whatsappnumber || '',
  });

  const [teamLeaderCode, setTeamLeaderCode] = useState('');

  const [accompanying, setAccompanying] = useState<any[]>([]);

  useEffect(() => {
    fetchEvents();
    fetchMyRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events/active');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      setErrorMessage('Unable to load events. Please check backend and CORS.');
    }
  };

  const fetchMyRegistrations = async () => {
    try {
      if (!volunteer?.vid) return;

      const response = await api.get(`/registrations/my?volunteerId=${volunteer.vid}`);
      const eventIds = response.data
        .map((registration: any) => registration.eventId)
        .filter((eventId: number | undefined) => eventId !== undefined);

      setRegisteredEvents(eventIds);
    } catch (error) {
      console.error('Error fetching my registrations:', error);
    }
  };

  const addVolunteer = () => {
    setAccompanying([
      ...accompanying,
      {
        volunteerId: '',
        name: '',
        age: '',
        relationship: '',
        lookupMessage: '',
      },
    ]);
  };

  const removeVolunteer = (indexToRemove: number) => {
    setAccompanying(accompanying.filter((_, index) => index !== indexToRemove));
  };

  const getErrorMessage = (error: any) => {
    if (typeof error?.response?.data === 'string') {
      return error.response.data;
    }

    if (error?.response?.data?.message) {
      return error.response.data.message;
    }

    if (error?.response?.data?.error) {
      return error.response.data.error;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Something went wrong. Please try again.';
  };

  const updateAccompanyingVolunteer = (index: number, field: string, value: string) => {
    const updated = [...accompanying];
    updated[index][field] = value;
    setAccompanying(updated);
  };

  const lookupAccompanyingVolunteer = async (index: number) => {
    const current = accompanying[index];
    const volunteerId = current?.volunteerId?.trim().toUpperCase();

    if (!volunteerId) return;

    try {
      const updated = [...accompanying];
      updated[index].volunteerId = volunteerId;
      updated[index].lookupMessage = 'Checking volunteer details...';
      setAccompanying(updated);

      const registrationResponse = await api.get(`/registrations/my?volunteerId=${volunteerId}`);
      const alreadyRegistered = Array.isArray(registrationResponse.data)
        && selectedEvent
        && registrationResponse.data.some((registration: any) => registration.eventId === selectedEvent.eventId);

      if (alreadyRegistered) {
        const latest = [...accompanying];
        latest[index].lookupMessage = 'This volunteer is already registered for this event.';
        setAccompanying(latest);
        return;
      }

      const volunteerResponse = await api.get(`/volunteers/${volunteerId}`);
      const volunteerDetails = volunteerResponse.data;

      const latest = [...accompanying];
      latest[index].name = volunteerDetails.displayName || volunteerDetails.name || '';
      latest[index].lookupMessage = 'Volunteer details loaded.';
      setAccompanying(latest);
    } catch (error: any) {
      console.error('Volunteer lookup error:', error);

      const latest = [...accompanying];
      latest[index].name = '';
      latest[index].lookupMessage = `Volunteer ID ${accompanying[index]?.volunteerId?.trim().toUpperCase()} is invalid or not found in SDHS records.`;
      setAccompanying(latest);
    }
  };

  const handleSubmit = async () => {
    if (!selectedEvent) return;

    setFormError('');

    if (!teamLeaderCode.trim()) {
      setFormError('Team Leader Code is required.');
      return;
    }

    const accompanyingIds = accompanying
      .map((v) => v.volunteerId?.trim().toUpperCase())
      .filter(Boolean);

    if (accompanyingIds.includes(volunteer?.vid?.toUpperCase())) {
      setFormError('Primary volunteer cannot be added again as an accompanying volunteer.');
      return;
    }

    if (new Set(accompanyingIds).size !== accompanyingIds.length) {
      setFormError('Duplicate accompanying volunteer IDs found.');
      return;
    }

    for (const v of accompanying) {
      if (!v.volunteerId?.trim() || !v.name?.trim() || !v.age) {
        setFormError('Please complete Volunteer ID, Full Name, and Age for all accompanying volunteers before submitting.');
        return;
      }

      if (v.lookupMessage === 'This volunteer is already registered for this event.') {
        setFormError(`Volunteer ${v.volunteerId} is already registered for this event.`);
        return;
      }

      if (v.lookupMessage?.includes('invalid or not found')) {
        setFormError(`Volunteer ID ${v.volunteerId} is invalid. Please enter a valid SDHS Volunteer ID.`);
        return;
      }
    }

    try {
      const participants = [
        {
          volunteerId: volunteer.vid,
          fullName:
            volunteer?.displayName ||
            `${primary.firstName} ${primary.lastName}`,
          age: Number(primary.age),
          relationship: 'SELF',
          type: 'PRIMARY',
        },
        ...accompanying.map((v) => ({
          volunteerId: v.volunteerId.trim().toUpperCase(),
          fullName: v.name.trim(),
          age: Number(v.age),
          relationship: v.relationship?.trim() || '',
          type: 'ACCOMPANYING',
        })),
      ];

      const payload = {
        eventId: selectedEvent.eventId,
        teamLeaderCode: teamLeaderCode,
        participants: participants,
      };

      await api.post('/registrations/camp', payload);

      alert(
        'Your registration has been submitted successfully and is pending organizer review. You will be notified once it is approved. For urgent questions, please contact the volunteer office or your team leader.'
      );
      window.location.href = '/volunteer/dashboard';
    } catch (error: any) {
      console.error('Submit error:', error);
      console.error('Backend response:', error.response);
      setFormError(getErrorMessage(error));
    }
  };

  return (
    <main className="sdhs-event-page">
      <div className="container py-5">
        {!selectedEvent ? (
          <>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold mb-0">Select Event to Register</h2>
              <a href="/volunteer/dashboard" className="btn btn-outline-primary">
                Back to Dashboard
              </a>
            </div>

            {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

            {events.length === 0 && !errorMessage && (
              <div className="alert alert-info">Loading events...</div>
            )}

            <div className="row g-4">
              {events.map((event) => (
                <div className="col-md-6 col-lg-4" key={event.eventId}>
                  <div className="sdhs-register-event-card">
                    <div className="sdhs-register-event-image">
                      <img src="/assets/img/activities/image1.jpg" alt={event.eventName} />
                    </div>

                    <div className="sdhs-register-event-body">
                      <h4>{event.eventName}</h4>

                      <p className="sdhs-register-event-date">
                        {event.startDate} - {event.endDate}
                      </p>

                      <p className="sdhs-register-event-location">
                        <i className="bi bi-geo-alt-fill me-2"></i>
                        {event.location || 'Location not available'}
                      </p>

                      {registeredEvents.includes(event.eventId) ? (
                        <button className="btn btn-secondary w-100 mt-3" disabled>
                          Already Registered
                        </button>
                      ) : (
                        <button
                          className="btn btn-primary w-100 mt-3"
                          onClick={() => setSelectedEvent(event)}
                        >
                          Register
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 className="fw-bold mb-4">Register for {selectedEvent.eventName}</h2>

            <div className="sdhs-form">
              <div className="row g-3">
                {formError && (
                  <div className="col-12">
                    <div className="alert alert-danger">{formError}</div>
                  </div>
                )}
                <h5 className="mt-3">Personal Details</h5>
                <div className="col-12">
                  <div className="alert alert-info">
                    Your volunteer details are auto-loaded from SDHS records.
                    <br />
                    If your information is incorrect, please contact the volunteer office or update request team.
                  </div>
                </div>

                <div className="col-md-6">
                  <label className="form-label">Volunteer ID</label>
                  <input className="form-control" value={volunteer?.vid || ''} readOnly />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Volunteer Name</label>
                  <input
                    className="form-control"
                    value={volunteer?.displayName || ''}
                    readOnly
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Centre</label>
                  <input
                    className="form-control"
                    value={volunteer?.vCentreID || volunteer?.vcentreid || ''}
                    readOnly
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    value={primary.mobile}
                    readOnly
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Email</label>
                  <input
                    className="form-control"
                    value={volunteer?.email || ''}
                    readOnly
                  />
                </div>

                {/* Present Address removed */}

                {/* Contact Information heading removed */}

                {/* Editable Mobile Number block removed */}

                {/* Whatsapp Number block removed */}

                <h5 className="mt-4">Team Leader</h5>

                <div className="col-md-6">
                  <label className="form-label">Team Leader Code</label>
                  <input
                    className="form-control"
                    value={teamLeaderCode}
                    onChange={(e) => setTeamLeaderCode(e.target.value)}
                  />
                </div>

                <h5 className="mt-4">Accompanying Volunteers</h5>

                <div className="col-12">
                  <button type="button" className="btn btn-outline-primary" onClick={addVolunteer}>
                    + Add Volunteer
                  </button>

                  {accompanying.map((vol, index) => (
                    <div className="sdhs-accompanying-row" key={index}>
                      <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                          <label className="form-label">Volunteer ID</label>
                          <input
                            className="form-control"
                            placeholder="VID"
                            value={vol.volunteerId}
                            onChange={(e) => updateAccompanyingVolunteer(index, 'volunteerId', e.target.value)}
                            onBlur={() => lookupAccompanyingVolunteer(index)}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Full Name</label>
                          <input
                            className="form-control"
                            placeholder="Full Name"
                            value={vol.name}
                            readOnly
                            onChange={(e) => updateAccompanyingVolunteer(index, 'name', e.target.value)}
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Age</label>
                          <input
                            className="form-control"
                            placeholder="Age"
                            type="number"
                            value={vol.age}
                            onChange={(e) => updateAccompanyingVolunteer(index, 'age', e.target.value)}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Relationship <span className="text-muted">(optional)</span></label>
                          <input
                            className="form-control"
                            placeholder="Relationship"
                            value={vol.relationship}
                            onChange={(e) => updateAccompanyingVolunteer(index, 'relationship', e.target.value)}
                          />
                        </div>

                        <div className="col-md-1">
                          <button
                            type="button"
                            className="btn btn-outline-danger w-100"
                            onClick={() => removeVolunteer(index)}
                          >
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                      {vol.lookupMessage && (
                        <small
                          className={
                            vol.lookupMessage.includes('already registered') ||
                            vol.lookupMessage.includes('invalid or not found')
                              ? 'text-danger'
                              : 'text-muted'
                          }
                        >
                          {vol.lookupMessage}
                        </small>
                      )}
                    </div>
                  ))}
                </div>

                {/* Payment Details section removed */}

                <div className="col-12 mt-3">
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" />
                    <label className="form-check-label">
                      I agree to Terms & Conditions
                    </label>
                  </div>
                </div>

                <div className="col-12 mt-3">
                  <button type="button" className="btn btn-success me-2" onClick={handleSubmit}>
                    Submit Registration
                  </button>

                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setSelectedEvent(null)}
                  >
                    Back
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}

export default EventRegistration;