import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminParticipantApproval() {

  const [participants, setParticipants] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPendingParticipants();
  }, []);

  const loadPendingParticipants = async () => {

    try {

      const response = await api.get(
        '/admin/participants/pending'
      );

      setParticipants(
        Array.isArray(response.data)
          ? response.data
          : []
      );

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  const toggleParticipant = (participantId: number) => {

    setSelectedIds((prev) => {

      if (prev.includes(participantId)) {
        return prev.filter(id => id !== participantId);
      }

      return [...prev, participantId];
    });
  };

  const approveSelected = async () => {

    if (selectedIds.length === 0) {
      alert('Please select participants.');
      return;
    }

    try {

      const registrationId =
        participants.find(
          p => p.participantId === selectedIds[0]
        )?.registrationId;

      await api.post(
        '/admin/participants/approve',
        {
          registrationId,
          participantIds: selectedIds
        }
      );

      alert('Participants approved.');

      setSelectedIds([]);

      loadPendingParticipants();

    } catch (error) {

      console.error(error);

      alert('Approval failed.');

    }
  };

  const rejectSelected = async () => {

    if (selectedIds.length === 0) {
      alert('Please select participants.');
      return;
    }

    if (!window.confirm('Reject selected participants?')) {
      return;
    }

    try {

      const registrationId =
        participants.find(
          p => p.participantId === selectedIds[0]
        )?.registrationId;

      await api.post(
        '/admin/participants/reject',
        {
          registrationId,
          participantIds: selectedIds
        }
      );

      alert('Participants rejected.');

      setSelectedIds([]);

      loadPendingParticipants();

    } catch (error) {

      console.error(error);

      alert('Rejection failed.');

    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        Loading pending participants...
      </div>
    );
  }

  return (
    <main className="sdhs-dashboard-page">

      <div className="container py-5">

        <div className="sdhs-dashboard-header">

          <div>
            <p className="text-muted mb-1">
              Admin Portal
            </p>

            <h1 className="fw-bold">
              Participant Approval
            </h1>
          </div>

        </div>

        {participants.length === 0 ? (

          <div className="alert alert-info mt-4">
            No participants pending review.
          </div>

        ) : (

          <>
            <div className="d-flex gap-2 mt-4 mb-4">

              <button
                className="btn btn-success"
                onClick={approveSelected}
              >
                Approve Selected
              </button>

              <button
                className="btn btn-danger"
                onClick={rejectSelected}
              >
                Reject Selected
              </button>

            </div>

            <div className="card shadow-sm border-0">

              <div className="table-responsive">

                <table className="table align-middle mb-0">

                  <thead>

                    <tr>
                      <th></th>
                      <th>VID</th>
                      <th>Name</th>
                      <th>Registration</th>
                      <th>Primary Volunteer</th>
                      <th>Relationship</th>
                      <th>Status</th>
                    </tr>

                  </thead>

                  <tbody>

                    {participants.map((p) => (

                      <tr key={p.participantId}>

                        <td>

                          <input
                            type="checkbox"
                            checked={selectedIds.includes(
                              p.participantId
                            )}
                            onChange={() =>
                              toggleParticipant(
                                p.participantId
                              )
                            }
                          />

                        </td>

                        <td>{p.volunteerId}</td>

                        <td>{p.fullName}</td>

                        <td>
                          #{p.registrationId}
                        </td>

                        <td>
                          {p.primaryVolunteerId}
                        </td>

                        <td>
                          {p.relationshipToPrimary}
                        </td>

                        <td>
                          {p.participantStatus}
                        </td>

                      </tr>

                    ))}

                  </tbody>

                </table>

              </div>

            </div>

          </>

        )}

      </div>

    </main>
  );
}

export default AdminParticipantApproval;