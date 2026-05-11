import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminRegistrationApproval() {
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [pendingParticipants, setPendingParticipants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadApprovalQueue();
  }, []);

  const loadApprovalQueue = async () => {
    try {
      setLoading(true);

      const [registrationResponse, participantResponse] = await Promise.all([
        api.get('/admin/registrations/pending'),
        api.get('/admin/participants/pending'),
      ]);

      setRegistrations(
        Array.isArray(registrationResponse.data)
          ? registrationResponse.data
          : []
      );

      setPendingParticipants(
        Array.isArray(participantResponse.data)
          ? participantResponse.data
          : []
      );
    } catch (error) {
      console.error('Error loading approval queue:', error);
    } finally {
      setLoading(false);
    }
  };

  const approveRegistration = async (registrationId: number) => {
    try {
      await api.post(`/admin/registrations/${registrationId}/approve`);
      alert('Registration approved for payment.');
      loadApprovalQueue();
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
      loadApprovalQueue();
    } catch (error) {
      console.error(error);
      alert('Failed to reject registration.');
    }
  };

  const approveAdditionalParticipant = async (participant: any) => {
    try {
      await api.post('/admin/participants/approve', {
        registrationId: participant.registrationId,
        participantIds: [participant.participantId],
      });

      alert('Additional volunteer approved for payment.');
      loadApprovalQueue();
    } catch (error) {
      console.error(error);
      alert('Failed to approve additional volunteer.');
    }
  };

  const rejectAdditionalParticipant = async (participant: any) => {
    if (!window.confirm('Reject this additional volunteer?')) return;

    try {
      await api.post('/admin/participants/reject', {
        registrationId: participant.registrationId,
        participantIds: [participant.participantId],
      });

      alert('Additional volunteer rejected.');
      loadApprovalQueue();
    } catch (error) {
      console.error(error);
      alert('Failed to reject additional volunteer.');
    }
  };

  if (loading) {
    return <div className="container py-5">Loading approval queue...</div>;
  }

  const hasNoPendingItems = registrations.length === 0 && pendingParticipants.length === 0;

  return (
    <main className="sdhs-dashboard-page">
      <div className="container py-5">
        <div className="sdhs-dashboard-header">
          <div>
            <p className="text-muted mb-1">Admin Portal</p>
            <h1 className="fw-bold">Registration Approval Queue</h1>
          </div>
        </div>

        {hasNoPendingItems && (
          <div className="alert alert-info mt-4">
            No registrations or additional volunteers are pending review.
          </div>
        )}

        {registrations.length > 0 && (
          <section className="mt-4">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h4 className="fw-bold mb-1">New Registrations</h4>
                <p className="text-muted mb-0">
                  Review first-time event registrations. Approval here creates the initial payment request.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {registrations.map((reg) => (
                <div className="col-lg-6" key={reg.registrationId}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <h5 className="mb-0">Registration #{reg.registrationId}</h5>
                        <span className="badge bg-primary">New Registration</span>
                      </div>

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
                        <ul className="mt-2 mb-0">
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
                          Approve for Payment
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
          </section>
        )}

        {pendingParticipants.length > 0 && (
          <section className="mt-5">
            <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
              <div>
                <h4 className="fw-bold mb-1">Additional Volunteers Added</h4>
                <p className="text-muted mb-0">
                  These volunteers were added after the primary registration. Approval creates payment only for the newly added volunteer, not for already processed participants.
                </p>
              </div>
            </div>

            <div className="row g-4">
              {pendingParticipants.map((participant) => (
                <div className="col-lg-6" key={participant.participantId}>
                  <div className="card shadow-sm border-0 h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start gap-2 mb-3">
                        <h5 className="mb-0">{participant.fullName}</h5>
                        <span className="badge bg-warning text-dark">Additional Volunteer</span>
                      </div>

                      <div className="alert alert-light border mb-3">
                        Primary volunteer may already have completed payment. This approval is only for the newly added volunteer shown below.
                      </div>

                      <p className="mb-1">
                        <strong>Volunteer ID:</strong> {participant.volunteerId}
                      </p>

                      <p className="mb-1">
                        <strong>Registration:</strong> #{participant.registrationId}
                      </p>

                      <p className="mb-1">
                        <strong>Primary Volunteer:</strong> {participant.primaryVolunteerId}
                      </p>

                      <p className="mb-1">
                        <strong>Event:</strong> {participant.eventName}
                      </p>

                      <p className="mb-1">
                        <strong>Relationship:</strong> {participant.relationshipToPrimary || '-'}
                      </p>

                      <p className="mb-3">
                        <strong>Status:</strong> {participant.participantStatus}
                      </p>

                      <div className="d-flex gap-2">
                        <button
                          className="btn btn-success flex-grow-1"
                          onClick={() => approveAdditionalParticipant(participant)}
                        >
                          Approve Added Volunteer
                        </button>

                        <button
                          className="btn btn-danger flex-grow-1"
                          onClick={() => rejectAdditionalParticipant(participant)}
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}

export default AdminRegistrationApproval;