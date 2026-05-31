import { useEffect, useState } from 'react';
import api from '../services/api';

type MyRegistration = {
  registrationId: number;
  eventName: string;
  status: string;
  participantsCount: number;
  amount: number;
  paymentStatus: string;
  hasPendingAdditionalVolunteers?: boolean;
};

function MyRegistrations() {
  const volunteer = JSON.parse(localStorage.getItem('volunteer') || '{}');
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [errorMessage, setErrorMessage] = useState('');
  const handleAddVolunteers = (registrationId: number) => {
  window.location.href = `/volunteer/add-volunteers/${registrationId}`;
};

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const fetchRegistrations = async () => {
    try {
      const response = await api.get(`/registrations/my?volunteerId=${volunteer.vid}`);
      setRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching registrations:', error);
      setErrorMessage('Unable to load registrations. Please try again.');
    }
  };

  return (
    <main className="sdhs-dashboard-page">
      <div className="container py-5">
        <div className="sdhs-dashboard-header">
          <div>
            <p className="mb-1 text-muted">Volunteer Portal</p>
            <h1 className="fw-bold mb-0">My Registrations</h1>
          </div>

          <a href="/volunteer/dashboard" className="btn btn-outline-primary">
            Back to Dashboard
          </a>
        </div>

        <div className="mt-4">
          {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}

          {registrations.length === 0 && !errorMessage ? (
            <div className="alert alert-info">No registrations found.</div>
          ) : (
            <div className="row g-4">
              {registrations.map((reg) => (
                <div className="col-md-6 col-lg-4" key={reg.registrationId}>
                  <div className="sdhs-dashboard-card">
                    <p className="text-muted mb-1">Registration #{reg.registrationId}</p>
                    <h4>{reg.eventName}</h4>

                    <p className="text-muted mb-1">
                      Participants: <strong>{reg.participantsCount}</strong>
                    </p>

                    <p className="text-muted mb-1">
                      Amount: <strong>₹{reg.amount}</strong>
                    </p>

                    <p className="text-muted mb-1">
                      Payment Status: <strong>{reg.paymentStatus}</strong>
                    </p>
                    

                    <p className="mb-2">
                      Registration Status: <strong>{reg.status}</strong>
                    </p>

                    {reg.hasPendingAdditionalVolunteers && (
                      <div className="alert alert-warning py-2 px-3 small">
                        Additional volunteers are pending organizer review.
                      </div>
                    )}

                    <button
                      className="btn btn-outline-primary w-100"
                      onClick={() =>
                        (window.location.href = `/volunteer/registration/${reg.registrationId}`)
                      }
                    >
                      View Details
                    </button>
                    <button
                      className="btn btn-primary mt-2 w-100"
                      onClick={() => handleAddVolunteers(reg.registrationId)}
                    >
                      Add Volunteers
                    </button>
                    {reg.status === 'APPROVED_FOR_PAYMENT' && !reg.hasPendingAdditionalVolunteers && (
                      <button
                        className="btn btn-success mt-2 w-100"
                        onClick={() =>
                          (window.location.href = `/volunteer/payment/${reg.registrationId}`)
                        }
                      >
                        Pay Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default MyRegistrations;