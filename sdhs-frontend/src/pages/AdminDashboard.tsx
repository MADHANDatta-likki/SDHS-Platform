import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '../components/AdminLayout';
import api from '../services/api';

type SummaryState = {
  pendingRegistrations: number | null;
  pendingPayments: number | null;
  confirmedParticipants: number | null;
  activeEvents: number | null;
};

type DashboardAction = {
  title: string;
  description: string;
  icon: string;
  path?: string;
  buttonLabel: string;
  disabled?: boolean;
};

const initialSummary: SummaryState = {
  pendingRegistrations: null,
  pendingPayments: null,
  confirmedParticipants: null,
  activeEvents: null,
};

const dashboardActions: DashboardAction[] = [
  {
    title: 'Create / Manage Events',
    description: 'Add new events, update dates, and control registration availability.',
    icon: 'bi-calendar-plus',
    path: '/admin/events',
    buttonLabel: 'Manage Events',
  },
  {
    title: 'Upload / Manage Images',
    description: 'Upload images for the home page, gallery, services, and events.',
    icon: 'bi-images',
    path: '/admin/images',
    buttonLabel: 'Manage Images',
  },
  {
    title: 'Registration Approval',
    description: 'Review new registrations and additional volunteers before payment.',
    icon: 'bi-person-check',
    path: '/admin/registration-approval',
    buttonLabel: 'Review Queue',
  },
  {
    title: 'Additional Volunteer Approval',
    description: 'Open the dedicated queue for volunteers added after registration.',
    icon: 'bi-people',
    path: '/admin/participant-approval',
    buttonLabel: 'Review Additions',
  },
  {
    title: 'Payment Approval',
    description: 'Verify submitted payment proof and confirm registrations.',
    icon: 'bi-receipt',
    path: '/admin/payment-verification',
    buttonLabel: 'Verify Payments',
  },
  {
    title: 'Participant Report',
    description: 'View confirmed participants, filter records, and export CSV reports.',
    icon: 'bi-table',
    path: '/admin/participant-report',
    buttonLabel: 'Open Report',
  },
  {
    title: 'Back to Website',
    description: 'Return to the public SDHS website.',
    icon: 'bi-house-door',
    path: '/',
    buttonLabel: 'Open Website',
  },
];

function AdminDashboard() {
  const [summary, setSummary] = useState<SummaryState>(initialSummary);
  const [summaryError, setSummaryError] = useState('');

  useEffect(() => {
    loadSummary();
  }, []);

  const loadSummary = async () => {
    try {
      setSummaryError('');

      // TODO: Replace these individual calls with a dedicated admin summary API
      // if the backend adds one later.
      const [
        pendingRegistrationsResponse,
        pendingPaymentsResponse,
        participantReportResponse,
        activeEventsResponse,
      ] = await Promise.all([
        api.get('/admin/registrations/pending'),
        api.get('/admin/payments/submitted'),
        api.get('/admin/reports/participants'),
        api.get('/events/active'),
      ]);

      const participantRows = Array.isArray(participantReportResponse.data)
        ? participantReportResponse.data
        : [];

      const confirmedParticipants = participantRows.filter((row: any) => {
        const participantStatus = String(row.participantStatus || '').toUpperCase();
        const paymentStatus = String(row.paymentStatus || '').toUpperCase();

        return participantStatus === 'CONFIRMED' || paymentStatus === 'VERIFIED';
      }).length;

      setSummary({
        pendingRegistrations: Array.isArray(pendingRegistrationsResponse.data)
          ? pendingRegistrationsResponse.data.length
          : 0,
        pendingPayments: Array.isArray(pendingPaymentsResponse.data)
          ? pendingPaymentsResponse.data.length
          : 0,
        confirmedParticipants,
        activeEvents: Array.isArray(activeEventsResponse.data)
          ? activeEventsResponse.data.length
          : 0,
      });
    } catch (error) {
      console.error('Error loading admin dashboard summary:', error);
      setSummary(initialSummary);
      setSummaryError('Dashboard counts are temporarily unavailable.');
    }
  };

  const summaryCards = [
    {
      label: 'Pending Registrations',
      value: summary.pendingRegistrations,
      icon: 'bi-person-plus',
    },
    {
      label: 'Pending Payments',
      value: summary.pendingPayments,
      icon: 'bi-credit-card',
    },
    {
      label: 'Confirmed Participants',
      value: summary.confirmedParticipants,
      icon: 'bi-check-circle',
    },
    {
      label: 'Active Events',
      value: summary.activeEvents,
      icon: 'bi-calendar-event',
    },
  ];

  return (
    <AdminLayout
      title="Admin Dashboard"
      subtitle="Review volunteer activity, approve registrations, verify payments, and manage public content."
    >
      {summaryError && (
        <div className="alert alert-warning mt-4 mb-0">{summaryError}</div>
      )}

      <section className="row g-4 mt-1">
        {summaryCards.map((card) => (
          <div className="col-12 col-sm-6 col-xl-3" key={card.label}>
            <div className="sdhs-admin-summary-card">
              <div className="sdhs-admin-summary-icon">
                <i className={`bi ${card.icon}`}></i>
              </div>
              <div>
                <p className="text-muted mb-1">{card.label}</p>
                <h2 className="fw-bold mb-0">
                  {card.value === null ? '--' : card.value}
                </h2>
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="row g-4 mt-2">
        {dashboardActions.map((action) => (
          <div className="col-md-6 col-xl-4" key={action.title}>
            <div className="sdhs-dashboard-card d-flex flex-column">
              <i className={`bi ${action.icon}`}></i>
              <h4>{action.title}</h4>
              <p className="flex-grow-1">{action.description}</p>

              {action.disabled ? (
                <button className="btn btn-outline-secondary mt-auto" disabled>
                  {action.buttonLabel}
                </button>
              ) : (
                <Link className="btn btn-primary mt-auto" to={action.path || '#'}>
                  {action.buttonLabel}
                </Link>
              )}
            </div>
          </div>
        ))}
      </section>
    </AdminLayout>
  );
}

export default AdminDashboard;
