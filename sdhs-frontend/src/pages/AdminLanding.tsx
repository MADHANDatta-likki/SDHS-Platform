import { Link } from 'react-router-dom';

function AdminLanding() {
  const volunteer = JSON.parse(localStorage.getItem('volunteer') || '{}');

  const logout = () => {
    localStorage.removeItem('volunteer');
    window.location.href = '/login';
  };

  return (
    <main className="sdhs-dashboard-page">
      <div className="container py-5">
        <div className="sdhs-dashboard-header">
          <div>
            <p className="text-muted mb-1">Welcome back</p>
            <h1 className="fw-bold mb-0">
              {volunteer.displayName || 'SDHS Volunteer'}
            </h1>
            <p className="text-muted mb-0 mt-2">
              {volunteer.adminRole ? `Admin Role: ${volunteer.adminRole}` : 'Choose where to continue.'}
            </p>
          </div>

          <button className="btn btn-outline-primary" onClick={logout}>
            Logout
          </button>
        </div>

        <section className="row g-4 mt-4">
          <div className="col-md-6">
            <div className="sdhs-dashboard-card h-100 d-flex flex-column">
              <i className="bi bi-person-badge-fill"></i>
              <h4>My Volunteer Profile</h4>
              <p className="flex-grow-1">
                Continue as a volunteer to view events, registrations, and profile details.
              </p>
              <Link className="btn btn-primary mt-auto" to="/volunteer/dashboard">
                Open Volunteer Profile
              </Link>
            </div>
          </div>

          <div className="col-md-6">
            <div className="sdhs-dashboard-card h-100 d-flex flex-column">
              <i className="bi bi-speedometer2"></i>
              <h4>Admin Dashboard</h4>
              <p className="flex-grow-1">
                Review applications, approvals, payments, reports, events, and public content.
              </p>
              <Link className="btn btn-primary mt-auto" to="/admin/dashboard">
                Open Admin Dashboard
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default AdminLanding;
