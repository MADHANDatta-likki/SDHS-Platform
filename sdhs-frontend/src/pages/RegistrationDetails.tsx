import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../services/api';

function RegistrationDetails() {
  const { registrationId } = useParams();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetchDetails();
  }, []);

  const fetchDetails = async () => {
    try {
      const response = await api.get(`/registrations/${registrationId}`);
      setData(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  if (!data) {
    return <div className="container py-5">Loading...</div>;
  }

  return (
    <main className="sdhs-dashboard-page">
      <div className="container py-5">

        <div className="sdhs-dashboard-header">
          <div>
            <p className="text-muted mb-1">Registration Details</p>
            <h1 className="fw-bold">{data.eventName}</h1>
          </div>

          <a href="/volunteer/registrations" className="btn btn-outline-primary">
            Back
          </a>
        </div>

        {/* Registration Info */}
        <div className="card p-3 mt-4">
          <h5>General Info</h5>
          <p><strong>Status:</strong> {data.registrationStatus}</p>
          <p><strong>Team Leader:</strong> {data.teamLeaderCode || '-'}</p>
        </div>

        {/* Participants */}
        <div className="card p-3 mt-4">
          <h5>Participants</h5>

          <table className="table">
            <thead>
              <tr>
                <th>VID</th>
                <th>Name</th>
                <th>Type</th>
                <th>Status</th>
                <th>Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {data.participants.map((p: any) => (
                <tr key={p.participantId}>
                  <td>{p.volunteerId}</td>
                  <td>{p.fullName}</td>
                  <td>{p.participantType}</td>
                  <td>{p.participantStatus}</td>
                  <td>{p.paymentId}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Payments */}
        <div className="card p-3 mt-4">
          <h5>Payments</h5>

          <table className="table">
            <thead>
              <tr>
                <th>Payment ID</th>
                <th>Amount</th>
                <th>UTR</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.payments.map((p: any) => (
                <tr key={p.paymentId}>
                  <td>{p.paymentId}</td>
                  <td>₹{p.amount}</td>
                  <td>{p.utrNumber}</td>
                  <td>{p.transactionDate}</td>
                  <td>{p.paymentStatus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

      </div>
    </main>
  );
}

export default RegistrationDetails;