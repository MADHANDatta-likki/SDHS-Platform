import { useState } from 'react';
import api from '../services/api';
import { buildStoragePath, STORAGE_BUCKET } from '../services/storageConfig';
import { supabase } from '../services/supabase';

type JoinUsForm = {
  fullName: string;
  contactNumber: string;
  email: string;
  place: string;
  photoUrl: string;
  referredByVolunteerId: string;
};

const initialForm: JoinUsForm = {
  fullName: '',
  contactNumber: '',
  email: '',
  place: '',
  photoUrl: '',
  referredByVolunteerId: '',
};

function JoinUs() {
  const [form, setForm] = useState<JoinUsForm>(initialForm);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const updateForm = (field: keyof JoinUsForm, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
    setErrorMessage('');
    setSuccessMessage('');
  };

  const getErrorMessage = (error: any) => {
    if (typeof error?.response?.data === 'string') {
      return error.response.data;
    }

    if (error?.message) {
      return error.message;
    }

    return 'Unable to submit your application. Please try again.';
  };

  const uploadPhoto = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    try {
      setUploading(true);
      setErrorMessage('');

      const safeFileName = file.name
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');

      const filePath = buildStoragePath(
        'volunteer-applicants',
        `${Date.now()}-${safeFileName}`
      );

      const { error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type,
        });

      if (error) {
        throw error;
      }

      const { data } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(filePath);

      updateForm('photoUrl', data.publicUrl);
    } catch (error) {
      console.error('Volunteer applicant photo upload error:', error);
      setErrorMessage('Photo upload failed. Please select the image again.');
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const validateForm = () => {
    if (!form.fullName.trim()) return 'Full Name is required.';
    if (!form.contactNumber.trim()) return 'Contact Number is required.';
    if (!form.place.trim()) return 'Place is required.';
    if (!form.photoUrl.trim()) return 'Photo upload is required.';
    if (!form.referredByVolunteerId.trim()) {
      return 'Referred By Volunteer ID is required.';
    }

    return '';
  };

  const submitApplication = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const validationMessage = validateForm();

    if (validationMessage) {
      setErrorMessage(validationMessage);
      return;
    }

    try {
      setSubmitting(true);
      setErrorMessage('');
      setSuccessMessage('');

      await api.post('/volunteer-applicants', {
        ...form,
        fullName: form.fullName.trim(),
        contactNumber: form.contactNumber.trim(),
        email: form.email.trim() || null,
        place: form.place.trim(),
        referredByVolunteerId: form.referredByVolunteerId.trim().toUpperCase(),
      });

      setForm(initialForm);
      setSuccessMessage(
        'Your volunteer application has been submitted for SDHS review.'
      );
    } catch (error) {
      console.error('Volunteer applicant submit error:', error);
      setErrorMessage(getErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="sdhs-login-page">
      <div className="container">
        <div className="row min-vh-100 align-items-center justify-content-center py-5">
          <div className="col-lg-7 col-xl-6">
            <div className="sdhs-login-card">
              <div className="text-center mb-4">
                <img src="/assets/img/logo.png" alt="SDHS Logo" width="72" />
                <h2 className="fw-bold mt-3">Join SDHS</h2>
                <p className="text-muted mb-0">
                  Submit your volunteer application for admin review.
                </p>
              </div>

              {successMessage && (
                <div className="alert alert-success">{successMessage}</div>
              )}

              {errorMessage && (
                <div className="alert alert-danger">{errorMessage}</div>
              )}

              <form onSubmit={submitApplication}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input
                      className="form-control form-control-lg"
                      value={form.fullName}
                      onChange={(e) => updateForm('fullName', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Contact Number
                    </label>
                    <input
                      className="form-control form-control-lg"
                      value={form.contactNumber}
                      onChange={(e) =>
                        updateForm('contactNumber', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Email</label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      value={form.email}
                      onChange={(e) => updateForm('email', e.target.value)}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Place</label>
                    <input
                      className="form-control form-control-lg"
                      value={form.place}
                      onChange={(e) => updateForm('place', e.target.value)}
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">
                      Referred By Volunteer ID
                    </label>
                    <input
                      className="form-control form-control-lg"
                      value={form.referredByVolunteerId}
                      onChange={(e) =>
                        updateForm('referredByVolunteerId', e.target.value)
                      }
                      required
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label fw-semibold">Upload Photo</label>
                    <input
                      type="file"
                      className="form-control form-control-lg"
                      accept="image/*"
                      onChange={uploadPhoto}
                      disabled={uploading}
                      required={!form.photoUrl}
                    />
                    {uploading && (
                      <small className="text-primary">Uploading photo...</small>
                    )}
                  </div>

                  {form.photoUrl && (
                    <div className="col-12">
                      <img
                        src={form.photoUrl}
                        alt="Applicant preview"
                        className="img-fluid rounded border"
                        style={{ maxHeight: '220px', objectFit: 'cover' }}
                      />
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-lg w-100 mt-4"
                  disabled={submitting || uploading}
                >
                  {submitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>

              <div className="text-center mt-4">
                <a href="/" className="sdhs-back-link">
                  Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default JoinUs;
