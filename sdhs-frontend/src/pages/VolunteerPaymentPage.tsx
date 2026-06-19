import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { buildStoragePath, STORAGE_BUCKET } from '../services/storageConfig';
import { supabase } from '../services/supabase';

function VolunteerPaymentPage() {

  const { registrationId } = useParams();
  const navigate = useNavigate();

  const [paymentDetails, setPaymentDetails] = useState<any>(null);

  const [utrNumber, setUtrNumber] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPaymentDetails();
  }, []);

  const loadPaymentDetails = async () => {
    try {
      const response = await api.get(
        `/payments/${registrationId}`
      );

      setPaymentDetails(response.data);

    } catch (error) {
      console.error(error);
      setMessage('Unable to load payment details.');
    }
  };

  const uploadProof = async () => {

    if (!proofFile) {
      throw new Error('Please select payment proof.');
    }

    const safeFileName = proofFile.name
      .toLowerCase()
      .replace(/[^a-z0-9.]/g, '-')
      .replace(/-+/g, '-');

    const filePath = buildStoragePath(
      `payments/registration-${registrationId}`,
      `${Date.now()}-${safeFileName}`
    );

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, proofFile, {
        cacheControl: '3600',
        upsert: false,
        contentType: proofFile.type,
      });

    if (error) {
      throw error;
    }

    const { data } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return data.publicUrl;
  };

  const submitPayment = async () => {

    try {

      setLoading(true);
      setMessage('');

      if (!utrNumber.trim()) {
        setMessage('Please enter transaction ID / UTR number.');
        return;
      }

      const proofUrl = await uploadProof();

      await api.post(
        `/payments/${registrationId}/submit`,
        {
          utrNumber: utrNumber.trim(),
          paymentProofFilePath: proofUrl
        }
      );

      alert(
        'Payment submitted successfully and pending organizer verification.'
      );

      navigate('/volunteer/dashboard');

    } catch (error: any) {

      console.error(error);

      setMessage(
        error?.response?.data ||
        error?.message ||
        'Payment submission failed.'
      );

    } finally {
      setLoading(false);
    }
  };

  if (!paymentDetails) {
    return (
      <div className="container py-5">
        Loading payment details...
      </div>
    );
  }

  return (
    <div className="container py-5">

      <div className="row justify-content-center">

        <div className="col-lg-8">

          <div className="card shadow-sm border-0">

            <div className="card-body p-4">

              <h3 className="mb-4">
                Event Payment
              </h3>

              {message && (
                <div className="alert alert-warning">
                  {message}
                </div>
              )}

              <div className="mb-4">

                <h5>Participants</h5>

                <ul className="list-group">

                  {paymentDetails.participants.map((p: any) => (

                    <li
                      key={p.participantId}
                      className="list-group-item d-flex justify-content-between"
                    >
                      <span>{p.fullName}</span>

                      <span>
                        {p.relationshipToPrimary}
                      </span>

                    </li>
                  ))}

                </ul>

              </div>

              <div className="mb-4">

                <h5>
                  Total Amount:
                </h5>

                <h3 className="text-success">
                  ₹ {paymentDetails.amount}
                </h3>

              </div>

              <div className="mb-4 text-center">

                {paymentDetails.paymentQrImage && !paymentDetails.paymentQrImage.includes('your-supabase-url') ? (
                  <img
                    src={paymentDetails.paymentQrImage}
                    alt="QR"
                    className="img-fluid"
                    style={{ maxWidth: '280px' }}
                  />
                ) : (
                  <div className="alert alert-info text-start">
                    Payment QR code is not configured yet. Please use the UPI ID below.
                  </div>
                )}

                <div className="mt-3">

                  <h5>
                    UPI ID
                  </h5>

                  <div className="fw-bold">
                    {paymentDetails.upiId}
                  </div>

                </div>

              </div>

              <div className="mb-3">

                <label className="form-label">
                  Transaction ID / UTR Number
                </label>

                <input
                  className="form-control"
                  value={utrNumber}
                  onChange={(e) =>
                    setUtrNumber(e.target.value)
                  }
                />

              </div>

              <div className="mb-4">

                <label className="form-label">
                  Upload Payment Screenshot
                </label>

                <input
                  type="file"
                  className="form-control"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setProofFile(file);
                    setProofPreviewUrl(file ? URL.createObjectURL(file) : '');
                  }}
                />

                {proofPreviewUrl && (
                  <div className="mt-3">
                    <img
                      src={proofPreviewUrl}
                      alt="Payment proof preview"
                      className="img-fluid rounded border"
                      style={{ maxHeight: '260px' }}
                    />
                  </div>
                )}

              </div>

              <button
                className="btn btn-success w-100"
                onClick={submitPayment}
                disabled={loading}
              >
                {loading
                  ? 'Submitting...'
                  : 'Submit Payment'}
              </button>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
}

export default VolunteerPaymentPage;
