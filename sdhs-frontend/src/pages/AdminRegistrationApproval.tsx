import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminRegistrationApproval() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingRegistrations();
  }, []);

  const loadPendingRegistrations = async () => {
    try {
      const response = await api.get('/admin/registrations/pending');
      setRegistrations(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading pending registrations:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (registrationId: number) => {
    try {
      await api.post(`/admin/registrations/${registrationId}/approve`);
      alert('Registration approved for payment.');
      loadPendingRegistrations();
    } catch (error) {
      console.error(error);
      alert('Failed to approve registration.');
    }
  };

  const rejectRegistration = async (registrationId: number) => {
    if (!window.confirm('Reject this registration?')) return;

    try {
      await api.post(`/admin/registrations/${registrationId}/reject`);
      alert('Registration rejected.');
      loadPendingRegistrations();
    } catch (error) {
      console.error(error);
      alert('Failed to reject registration.');
    }
  };

  if (loading) {
    return <div className="container py-5">Loading pending registrations...</div>;
  }

  return (
    <main className="sdhs-dashboard-page">
      <div className="container py-5">
        <div className="sdhs-dashboard-header">
          <div>
            <p className="text-muted mb-1">Admin Portal</p>
            <h1 className="fw-bold">Registration Approval</h1>
          </div>
        </div>

        {registrations.length === 0 ? (
          <div className="alert alert-info mt-4">
            No registrations pending review.
          </div>
        ) : (
          <div className="row g-4 mt-2">
            {registrations.map((reg) => (
              <div className="col-lg-6" key={reg.registrationId}>
                <div className="card shadow-sm border-0 h-100">
                  <div className="card-body">
                    <h5>Registration #{reg.registrationId}</h5>

                    <p className="mb-1">
                      <strong>Primary Volunteer:</strong> {reg.primaryVolunteerId}
                    </p>

                    <p className="mb-1">
                      <strong>Team Leader Code:</strong> {reg.teamLeaderCode || '-'}
                    </p>

                    <p className="mb-1">
                      <strong>Status:</strong> {reg.status}
                    </p>

                    <p className="mb-3">
                      <strong>Participants:</strong> {reg.participantsCount}
                    </p>

                    <div className="mb-3">
                      <strong>Participant Details</strong>
                      <ul className="mt-2">
                        {reg.participants?.map((p: any) => (
                          <li key={p.participantId}>
                            {p.fullName} ({p.volunteerId}) - {p.participantType}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-success flex-grow-1"
                        onClick={() => approveRegistration(reg.registrationId)}
                      >
                        Approve
                      </button>

                      <button
                        className="btn btn-danger flex-grow-1"
                        onClick={() => rejectRegistration(reg.registrationId)}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminRegistrationApproval;