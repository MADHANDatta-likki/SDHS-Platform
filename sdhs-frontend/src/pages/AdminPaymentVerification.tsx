import { useEffect, useState } from 'react';
import api from '../services/api';

function AdminPaymentVerification() {

  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayments();
  }, []);

  const loadPayments = async () => {

    try {

      const response = await api.get(
        '/admin/payments/submitted'
      );

      setPayments(response.data);

    } catch (error) {

      console.error(error);

    } finally {

      setLoading(false);

    }
  };

  const verifyPayment = async (registrationId: number) => {

    try {

      await api.post(
        `/admin/payments/${registrationId}/verify`
      );

      alert('Payment verified successfully.');

      loadPayments();

    } catch (error) {

      console.error(error);

      alert('Failed to verify payment.');

    }
  };

  const rejectPayment = async (registrationId: number) => {

    const confirmed = window.confirm(
      'Reject this payment?'
    );

    if (!confirmed) {
      return;
    }

    try {

      await api.post(
        `/admin/payments/${registrationId}/reject`
      );

      alert('Payment rejected.');

      loadPayments();

    } catch (error) {

      console.error(error);

      alert('Failed to reject payment.');

    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        Loading submitted payments...
      </div>
    );
  }

  return (
    <div className="container py-5">

      <h2 className="mb-4">
        Payment Verification
      </h2>

      {payments.length === 0 && (
        <div className="alert alert-info">
          No submitted payments pending verification.
        </div>
      )}

      <div className="row">

        {payments.map((payment) => (

          <div
            className="col-lg-6 mb-4"
            key={payment.paymentId}
          >

            <div className="card shadow-sm border-0 h-100">

              <div className="card-body">

                <h5 className="mb-3">
                  Volunteer:
                  {' '}
                  {payment.volunteerId}
                </h5>

                <div className="mb-3">

                  <strong>Amount:</strong>
                  {' '}
                  ₹ {payment.amount}

                </div>

                <div className="mb-3">

                  <strong>UTR:</strong>
                  {' '}
                  {payment.utrNumber}

                </div>

                <div className="mb-3">

                  <strong>Participants</strong>

                  <ul className="mt-2">

                    {payment.participants.map((p: any) => (

                      <li key={p.participantId}>
                        {p.fullName}
                        {' '}
                        ({p.relationshipToPrimary})
                      </li>

                    ))}

                  </ul>

                </div>

                <div className="mb-4">

                  <strong>
                    Payment Screenshot
                  </strong>

                  <div className="mt-2">

                    <img
                      src={payment.paymentProofFilePath}
                      alt="Payment Proof"
                      className="img-fluid rounded border"
                      style={{
                        maxHeight: '320px'
                      }}
                    />

                  </div>

                </div>

                <div className="d-flex gap-2">

                  <button
                    className="btn btn-success flex-grow-1"
                    onClick={() =>
                      verifyPayment(
                        payment.registrationId
                      )
                    }
                  >
                    Verify
                  </button>

                  <button
                    className="btn btn-danger flex-grow-1"
                    onClick={() =>
                      rejectPayment(
                        payment.registrationId
                      )
                    }
                  >
                    Reject
                  </button>

                </div>

              </div>

            </div>

          </div>

        ))}

      </div>

    </div>
  );
}

export default AdminPaymentVerification;