import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

type AdminLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const adminNavItems = [
  {
    label: 'Dashboard',
    path: '/admin/dashboard',
    icon: 'bi-speedometer2',
  },
  {
    label: 'Images',
    path: '/admin/images',
    icon: 'bi-images',
  },
  {
    label: 'Registrations',
    path: '/admin/registration-approval',
    icon: 'bi-person-check',
  },
  {
    label: 'Participants',
    path: '/admin/participant-approval',
    icon: 'bi-people',
  },
  {
    label: 'Payments',
    path: '/admin/payment-verification',
    icon: 'bi-receipt',
  },
  {
    label: 'Report',
    path: '/admin/participant-report',
    icon: 'bi-table',
  },
];

function AdminLayout({ title, subtitle, children }: AdminLayoutProps) {
  return (
    <main className="sdhs-dashboard-page">
      <nav className="navbar navbar-expand-lg sdhs-admin-navbar">
        <div className="container">
          <NavLink className="navbar-brand fw-bold" to="/admin/dashboard">
            SDHS Admin
          </NavLink>

          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#sdhsAdminNav"
            aria-controls="sdhsAdminNav"
            aria-expanded="false"
            aria-label="Toggle admin navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="sdhsAdminNav">
            <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-2">
              {adminNavItems.map((item) => (
                <li className="nav-item" key={item.path}>
                  <NavLink
                    className={({ isActive }) =>
                      `nav-link sdhs-admin-nav-link${isActive ? ' active' : ''}`
                    }
                    to={item.path}
                  >
                    <i className={`bi ${item.icon} me-2`}></i>
                    {item.label}
                  </NavLink>
                </li>
              ))}

              <li className="nav-item">
                <NavLink className="btn btn-outline-primary ms-lg-2" to="/">
                  <i className="bi bi-house-door me-2"></i>
                  Website
                </NavLink>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="sdhs-dashboard-header">
          <div>
            <p className="text-muted mb-1">Admin Portal</p>
            <h1 className="fw-bold mb-0">{title}</h1>
            {subtitle && <p className="text-muted mb-0 mt-2">{subtitle}</p>}
          </div>
        </div>

        {children}
      </div>
    </main>
  );
}

export default AdminLayout;
