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
  const [registeredEvents, setRegisteredEvents] = useState<number[]>([]);

  const volunteer = JSON.parse(localStorage.getItem('volunteer') || '{}');

  const [primary, setPrimary] = useState({
    firstName: '',
    lastName: '',
    age: '',
    mobile: '',
  });

  const [teamLeaderCode, setTeamLeaderCode] = useState('');
  const [utrNumber, setUtrNumber] = useState('');
  const [transactionDate, setTransactionDate] = useState('');

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
      },
    ]);
  };

  const removeVolunteer = (indexToRemove: number) => {
    setAccompanying(accompanying.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async () => {
    if (!selectedEvent) return;

    try {
      const participants = [
        {
          volunteerId: volunteer.vid,
          fullName: `${primary.firstName} ${primary.lastName}`,
          age: Number(primary.age),
          relationship: 'SELF',
          type: 'PRIMARY',
        },
        ...accompanying.map((v) => ({
          volunteerId: v.volunteerId,
          fullName: v.name,
          age: Number(v.age),
          relationship: v.relationship,
          type: 'ACCOMPANYING',
        })),
      ];

      const payload = {
        eventId: selectedEvent.eventId,
        teamLeaderCode,
        participants,
        payment: {
          amount: (1 + accompanying.length) * (selectedEvent.feePerPerson || 0),
          utrNumber,
          transactionDate,
        },
      };

      await api.post('/registrations/camp', payload);

      alert('Registration submitted successfully');
      window.location.href = '/volunteer/dashboard';
    } catch (error: any) {
  console.error('Submit error:', error);
  console.error('Backend response:', error.response);

  alert(
    error.response?.data ||
    error.message ||
    'Error submitting registration'
  );
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
                <h5 className="mt-3">Personal Details</h5>

                <div className="col-md-6">
                  <label className="form-label">First Name</label>
                  <input
                    className="form-control"
                    value={primary.firstName}
                    onChange={(e) => setPrimary({ ...primary, firstName: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Last Name</label>
                  <input
                    className="form-control"
                    value={primary.lastName}
                    onChange={(e) => setPrimary({ ...primary, lastName: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Age</label>
                  <input
                    className="form-control"
                    type="number"
                    value={primary.age}
                    onChange={(e) => setPrimary({ ...primary, age: e.target.value })}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label">Gender</label>
                  <select className="form-select">
                    <option>Male</option>
                    <option>Female</option>
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label">Blood Group</label>
                  <select className="form-select">
                    <option>A+</option>
                    <option>B+</option>
                    <option>O+</option>
                    <option>AB+</option>
                  </select>
                </div>

                <div className="col-12">
                  <label className="form-label">Present Address</label>
                  <textarea className="form-control"></textarea>
                </div>

                <h5 className="mt-4">Contact Information</h5>

                <div className="col-md-6">
                  <label className="form-label">Mobile Number</label>
                  <input
                    className="form-control"
                    value={primary.mobile}
                    onChange={(e) => setPrimary({ ...primary, mobile: e.target.value })}
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label">Whatsapp Number</label>
                  <input className="form-control" />
                </div>

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
                            onChange={(e) => {
                              const updated = [...accompanying];
                              updated[index].volunteerId = e.target.value;
                              setAccompanying(updated);
                            }}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Full Name</label>
                          <input
                            className="form-control"
                            placeholder="Full Name"
                            value={vol.name}
                            onChange={(e) => {
                              const updated = [...accompanying];
                              updated[index].name = e.target.value;
                              setAccompanying(updated);
                            }}
                          />
                        </div>

                        <div className="col-md-2">
                          <label className="form-label">Age</label>
                          <input
                            className="form-control"
                            placeholder="Age"
                            type="number"
                            value={vol.age}
                            onChange={(e) => {
                              const updated = [...accompanying];
                              updated[index].age = e.target.value;
                              setAccompanying(updated);
                            }}
                          />
                        </div>

                        <div className="col-md-3">
                          <label className="form-label">Relationship</label>
                          <input
                            className="form-control"
                            placeholder="Relationship"
                            value={vol.relationship}
                            onChange={(e) => {
                              const updated = [...accompanying];
                              updated[index].relationship = e.target.value;
                              setAccompanying(updated);
                            }}
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
                    </div>
                  ))}
                </div>

                <h5 className="mt-4">Payment Details</h5>

                <div className="col-md-3">
                  <label className="form-label">Participants</label>
                  <input className="form-control" value={1 + accompanying.length} readOnly />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Amount</label>
                  <input
                    className="form-control"
                    value={`₹${(1 + accompanying.length) * (selectedEvent.feePerPerson || 0)}`}
                    readOnly
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">UTR Number</label>
                  <input
                    className="form-control"
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                  />
                </div>

                <div className="col-md-3">
                  <label className="form-label">Transaction Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={transactionDate}
                    onChange={(e) => setTransactionDate(e.target.value)}
                  />
                </div>

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