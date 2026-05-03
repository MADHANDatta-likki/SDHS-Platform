import { useEffect } from 'react';

function VolunteerDashboard() {
  const volunteer = JSON.parse(localStorage.getItem('volunteer') || '{}');

  useEffect(() => {
    const storedVolunteer = localStorage.getItem('volunteer');

    if (!storedVolunteer) {
      window.location.href = '/login';
    }
  }, []);

  return (
    <main className="sdhs-dashboard-page">
      <div className="container py-5">
        <div className="sdhs-dashboard-header">
          <div>
            <p className="mb-1 text-muted">Welcome back</p>
            <h1 className="fw-bold mb-0">
              Welcome, {volunteer.displayName || 'Volunteer'}
            </h1>
          </div>

          <button
            className="btn btn-outline-primary"
            onClick={() => {
              localStorage.removeItem('volunteer');
              window.location.href = '/login';
            }}
          >
            Logout
          </button>
        </div>

        <div className="row g-4 mt-4">
          <div className="col-md-6 col-lg-4">
            <div className="sdhs-dashboard-card">
              <i className="bi bi-calendar-event-fill"></i>
              <h4>Upcoming Events</h4>
              <p>View upcoming SDHS events and register for volunteer service.</p>
              <a href="/events/register" className="btn btn-primary">
                Register for Event
              </a>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="sdhs-dashboard-card">
              <i className="bi bi-person-badge-fill"></i>
              <h4>My Volunteer Details</h4>
              <p>View your volunteer profile information from SDHS records.</p>
              <button className="btn btn-outline-primary" disabled>
                Coming Soon
              </button>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="sdhs-dashboard-card">
              <i className="bi bi-check2-circle"></i>
              <h4>My Registrations</h4>
              <p>Track events you have registered for and participation status.</p>
              <a href="/volunteer/registrations" className="btn btn-outline-primary">
  View Registrations
</a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default VolunteerDashboard;