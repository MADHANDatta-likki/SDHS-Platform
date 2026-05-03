import { useState } from 'react';
import api from '../services/api';

function Login() {
  const [volunteerId, setVolunteerId] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
  event.preventDefault();

  try {
    const response = await api.post('/auth/login', {
      volunteerId,
      phoneNumber,
    });

    localStorage.setItem('volunteer', JSON.stringify(response.data));

    window.location.href = '/volunteer/dashboard';
  } catch (error: any) {

    console.error('Login error:', error);

    console.error('Response:', error.response);

    alert(

      error.response?.data ||

      'Login failed. Please check backend/CORS/credentials.'

    );

  }
};

  return (
    <main className="sdhs-login-page">
      <div className="container">
        <div className="row min-vh-100 align-items-center justify-content-center">
          <div className="col-lg-5 col-md-8">
            <div className="sdhs-login-card">
              <div className="text-center mb-4">
                <img src="/assets/img/logo.png" alt="SDHS Logo" width="72" />
                <h2 className="fw-bold mt-3">Volunteer Login</h2>
                <p className="text-muted">
                  Login using your Volunteer ID and registered phone number.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label fw-semibold">Volunteer ID</label>
                  <input
                    type="text"
                    className="form-control form-control-lg"
                    placeholder="Enter Volunteer ID"
                    value={volunteerId}
                    onChange={(e) => setVolunteerId(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label fw-semibold">Phone Number</label>
                  <input
                    type="password"
                    className="form-control form-control-lg"
                    placeholder="Enter registered phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>

                <button type="submit" className="btn btn-primary btn-lg w-100">
                  Login
                </button>
              </form>

              <div className="text-center mt-4">
                <a href="/" className="sdhs-back-link">
                  ← Back to Home
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;