import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

type VolunteerApplicant = {
  applicantId: number;
  fullName: string;
  contactNumber: string;
  email?: string;
  place: string;
  photoUrl: string;
  referredByVolunteerId: string;
  referredByVolunteerName?: string;
  referredByCenterCode?: string;
  applicantStatus: string;
  adminComments?: string;
  createdAt?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  possibleDuplicateVolunteerId?: string;
  possibleDuplicateVolunteerName?: string;
  possibleDuplicateCenterCode?: string;
  possibleDuplicatePhone?: string;
  possibleDuplicateEmail?: string;
  possibleDuplicateImageUrl?: string;
};

function AdminVolunteerApplicants() {
  const [applicants, setApplicants] = useState<VolunteerApplicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  const [selectedDuplicate, setSelectedDuplicate] =
    useState<VolunteerApplicant | null>(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    loadApplicants();
  }, []);

  const getErrorMessage = (error: any) => {
    if (typeof error?.response?.data === 'string') {
      return error.response.data;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Volunteer applicant request could not be processed.';
  };

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setErrorMessage('');

      const response = await api.get('/admin/volunteer-applicants', {
        params: {
          status: 'PENDING_REVIEW',
        },
      });

      setApplicants(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error loading volunteer applicants:', error);
      setErrorMessage(getErrorMessage(error));
      setApplicants([]);
    } finally {
      setLoading(false);
    }
  };

  const approveApplicant = async (applicantId: number) => {
    try {
      setActionLoadingId(applicantId);
      setErrorMessage('');
      setSuccessMessage('');

      await api.patch(`/admin/volunteer-applicants/${applicantId}/approve`);

      setSuccessMessage('Volunteer applicant approved.');
      await loadApplicants();
    } catch (error) {
      console.error('Error approving volunteer applicant:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setActionLoadingId(null);
    }
  };

  const rejectApplicant = async (applicantId: number) => {
    const adminComments = window.prompt('Enter rejection comments');

    if (!adminComments || !adminComments.trim()) {
      return;
    }

    try {
      setActionLoadingId(applicantId);
      setErrorMessage('');
      setSuccessMessage('');

      await api.patch(`/admin/volunteer-applicants/${applicantId}/reject`, {
        adminComments: adminComments.trim(),
      });

      setSuccessMessage('Volunteer applicant rejected.');
      await loadApplicants();
    } catch (error) {
      console.error('Error rejecting volunteer applicant:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setActionLoadingId(null);
    }
  };

  const formatDate = (value?: string) => {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleDateString();
  };

  const formatDateTime = (value?: string) => {
    if (!value) {
      return '-';
    }

    return new Date(value).toLocaleString();
  };

  const formatReviewedBy = (value?: string) => {
    if (!value || !value.trim()) {
      return '-';
    }

    return value;
  };

  const formatReferrer = (applicant: VolunteerApplicant) => {
    return [
      applicant.referredByVolunteerId,
      applicant.referredByVolunteerName,
      applicant.referredByCenterCode,
    ]
      .filter(Boolean)
      .join(' - ');
  };

  const formatDuplicateTitle = (applicant: VolunteerApplicant) => {
    return [
      applicant.possibleDuplicateVolunteerId,
      applicant.possibleDuplicateVolunteerName,
      applicant.possibleDuplicateCenterCode,
    ]
      .filter(Boolean)
      .join(' - ');
  };

  const closeDuplicateModal = () => {
    setSelectedDuplicate(null);
  };

  return (
    <AdminLayout
      title="Volunteer Applicants"
      subtitle="Review Join Us applications submitted from the public website."
    >
      <div className="d-flex justify-content-end mt-4">
        <Link className="btn btn-outline-secondary" to="/admin/dashboard">
          Back to Dashboard
        </Link>
      </div>

      {successMessage && (
        <div className="alert alert-success mt-4">{successMessage}</div>
      )}

      {errorMessage && (
        <div className="alert alert-danger mt-4">{errorMessage}</div>
      )}

      <div className="card shadow-sm border-0 mt-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center gap-3 mb-3">
            <h4 className="fw-bold mb-0">Pending Applicants</h4>
            <button className="btn btn-outline-primary btn-sm" onClick={loadApplicants}>
              Refresh
            </button>
          </div>

          {loading ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" />
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table align-middle table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Photo</th>
                    <th>Name</th>
                    <th>Contact</th>
                    <th>Email</th>
                    <th>Place</th>
                    <th>Referred By</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Reviewed At</th>
                    <th>Reviewed By</th>
                    <th>Duplicate</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {applicants.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="text-center py-5">
                        <div className="text-muted mb-3">
                          No volunteer applicants are pending review.
                        </div>
                        <Link className="btn btn-outline-secondary" to="/admin/dashboard">
                          Back to Dashboard
                        </Link>
                      </td>
                    </tr>
                  ) : (
                    applicants.map((applicant) => (
                      <tr key={applicant.applicantId}>
                        <td>
                          <img
                            src={applicant.photoUrl}
                            alt={applicant.fullName}
                            className="rounded border"
                            style={{
                              width: '64px',
                              height: '64px',
                              objectFit: 'cover',
                            }}
                          />
                        </td>
                        <td className="fw-semibold">{applicant.fullName}</td>
                        <td>{applicant.contactNumber}</td>
                        <td>{applicant.email || '-'}</td>
                        <td>{applicant.place}</td>
                        <td>{formatReferrer(applicant)}</td>
                        <td>
                          <span className="badge bg-warning text-dark">
                            {applicant.applicantStatus}
                          </span>
                        </td>
                        <td>{formatDate(applicant.createdAt)}</td>
                        <td>{formatDateTime(applicant.reviewedAt)}</td>
                        <td>{formatReviewedBy(applicant.reviewedBy)}</td>
                        <td>
                          {applicant.possibleDuplicateVolunteerId ? (
                            <button
                              className="btn btn-outline-warning btn-sm"
                              onClick={() => setSelectedDuplicate(applicant)}
                            >
                              Possible Existing Volunteer
                            </button>
                          ) : (
                            '-'
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-2">
                            <button
                              className="btn btn-success btn-sm"
                              onClick={() => approveApplicant(applicant.applicantId)}
                              disabled={actionLoadingId === applicant.applicantId}
                            >
                              Approve
                            </button>
                            <button
                              className="btn btn-danger btn-sm"
                              onClick={() => rejectApplicant(applicant.applicantId)}
                              disabled={actionLoadingId === applicant.applicantId}
                            >
                              Reject
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedDuplicate && (
        <div
          className="modal fade show d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Possible Existing Volunteer</h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeDuplicateModal}
                ></button>
              </div>

              <div className="modal-body">
                <div className="d-flex gap-3 align-items-start">
                  <div>
                    {selectedDuplicate.possibleDuplicateImageUrl ? (
                      <>
                        <img
                          src={selectedDuplicate.possibleDuplicateImageUrl}
                          alt={selectedDuplicate.possibleDuplicateVolunteerName || 'Volunteer'}
                          className="rounded border"
                          style={{
                            width: '120px',
                            height: '120px',
                            objectFit: 'cover',
                          }}
                          onError={(event) => {
                            event.currentTarget.style.display = 'none';

                            const fallback =
                              event.currentTarget.nextElementSibling as HTMLElement | null;

                            if (fallback) {
                              fallback.style.display = 'flex';
                            }
                          }}
                        />
                        <div
                          className="rounded border bg-light text-muted align-items-center justify-content-center text-center"
                          style={{
                            width: '120px',
                            height: '120px',
                            display: 'none',
                          }}
                        >
                          No Image
                        </div>
                      </>
                    ) : (
                      <div
                        className="rounded border bg-light text-muted d-flex align-items-center justify-content-center text-center"
                        style={{
                          width: '120px',
                          height: '120px',
                        }}
                      >
                        No Image
                      </div>
                    )}
                  </div>

                  <div className="flex-grow-1">
                    <h5 className="fw-bold mb-3">
                      {selectedDuplicate.possibleDuplicateVolunteerName || '-'}
                    </h5>

                    <p className="mb-2">
                      <strong>Volunteer ID:</strong>{' '}
                      {selectedDuplicate.possibleDuplicateVolunteerId || '-'}
                    </p>
                    <p className="mb-2">
                      <strong>Center:</strong>{' '}
                      {selectedDuplicate.possibleDuplicateCenterCode || '-'}
                    </p>
                    <p className="mb-2">
                      <strong>Phone:</strong>{' '}
                      {selectedDuplicate.possibleDuplicatePhone || '-'}
                    </p>
                    <p className="mb-0">
                      <strong>Email:</strong>{' '}
                      {selectedDuplicate.possibleDuplicateEmail || '-'}
                    </p>
                  </div>
                </div>

                <div className="alert alert-warning mt-4 mb-0">
                  Applicant may match existing volunteer{' '}
                  <strong>{formatDuplicateTitle(selectedDuplicate)}</strong>.
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={closeDuplicateModal}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedDuplicate && (
        <div className="modal-backdrop fade show"></div>
      )}
    </AdminLayout>
  );
}

export default AdminVolunteerApplicants;
