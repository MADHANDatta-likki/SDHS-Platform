

import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

interface ParticipantReportRow {
  registrationId: number;
  participantId: number;
  eventId: number;
  eventName: string;
  volunteerId: string;
  volunteerName: string;
  centerCode: string;
  age: number;
  phone: string;
  email: string;
  registrationStatus: string;
  participantStatus: string;
  paymentStatus: string;
  addedLater: boolean;
  accommodationRequired: boolean;
  imageUrl: string;
}

interface EventItem {
  eventId: number;
  eventName: string;
}

export default function AdminParticipantReport() {
  const [rows, setRows] = useState<ParticipantReportRow[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const [eventId, setEventId] = useState('');
  const [participantStatus, setParticipantStatus] = useState('');
  const [centerCode, setCenterCode] = useState('');
  const [searchText, setSearchText] = useState('');

  useEffect(() => {
    loadEvents();
    loadReport();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await axios.get(`${API_BASE}/api/events/active`);
      setEvents(response.data || []);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  const loadReport = async () => {
    try {
      setLoading(true);

      const response = await axios.get(
        `${API_BASE}/api/admin/reports/participants`,
        {
          params: {
            eventId: eventId || undefined,
            participantStatus: participantStatus || undefined,
            centerCode: centerCode || undefined,
          },
        }
      );

      setRows(response.data || []);
    } catch (error) {
      console.error('Error loading participant report:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredRows = useMemo(() => {
    if (!searchText.trim()) {
      return rows;
    }

    const value = searchText.toLowerCase();

    return rows.filter(
      (row) =>
        row.volunteerId?.toLowerCase().includes(value) ||
        row.volunteerName?.toLowerCase().includes(value)
    );
  }, [rows, searchText]);

  const exportCsv = () => {
    const headers = [
      'Volunteer ID',
      'Volunteer Name',
      'Center Code',
      'Age',
      'Phone',
      'Email',
      'Event',
      'Registration Status',
      'Participant Status',
      'Payment Status',
      'Accommodation Required',
    ];

    const csvRows = filteredRows.map((row) => [
      row.volunteerId,
      row.volunteerName,
      row.centerCode,
      row.age,
      row.phone,
      row.email,
      row.eventName,
      row.registrationStatus,
      row.participantStatus,
      row.paymentStatus,
      row.accommodationRequired ? 'YES' : 'NO',
    ]);

    const csvContent = [headers, ...csvRows]
      .map((e) => e.map((x) => `"${x ?? ''}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], {
      type: 'text/csv;charset=utf-8;',
    });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'sdhs-participant-report.csv';
    link.click();
  };

  return (
    <div className="container py-4">
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center mb-4 gap-3">
        <div>
          <h2 className="fw-bold mb-1">Participant Report</h2>
          <p className="text-muted mb-0">
            Approved registrations and payment completed participant details.
          </p>
        </div>

        <button className="btn btn-success" onClick={exportCsv}>
          Export CSV
        </button>
      </div>

      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Event</label>

              <select
                className="form-select"
                value={eventId}
                onChange={(e) => setEventId(e.target.value)}
              >
                <option value="">All Events</option>

                {events.map((event) => (
                  <option key={event.eventId} value={event.eventId}>
                    {event.eventName}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">Status</label>

              <select
                className="form-select"
                value={participantStatus}
                onChange={(e) => setParticipantStatus(e.target.value)}
              >
                <option value="">All</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="APPROVED_FOR_PAYMENT">
                  Approved Pending Payment
                </option>
                <option value="PAYMENT_SUBMITTED">
                  Payment Submitted
                </option>
                <option value="CONFIRMED">Confirmed</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>

            <div className="col-12 col-md-6 col-lg-2">
              <label className="form-label fw-semibold">Center</label>

              <input
                className="form-control"
                placeholder="HYD / PTP"
                value={centerCode}
                onChange={(e) => setCenterCode(e.target.value)}
              />
            </div>

            <div className="col-12 col-md-6 col-lg-3">
              <label className="form-label fw-semibold">
                Volunteer Search
              </label>

              <input
                className="form-control"
                placeholder="Volunteer ID or Name"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </div>

            <div className="col-12 col-lg-1 d-flex align-items-end">
              <button className="btn btn-primary w-100" onClick={loadReport}>
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-sm border-0">
        <div className="card-body">
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
                    <th>Volunteer ID</th>
                    <th>Name</th>
                    <th>Center</th>
                    <th>Age</th>
                    <th>Phone</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Accommodation</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-5 text-muted">
                        No participant records found.
                      </td>
                    </tr>
                  ) : (
                    filteredRows.map((row) => (
                      <tr key={row.participantId}>
                        <td>
                          <div className="sdhs-volunteer-photo-wrapper">
                            <img
                              src={row.imageUrl}
                              alt={row.volunteerName}
                              className="sdhs-volunteer-photo"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none';

                                const fallback =
                                  e.currentTarget.nextElementSibling as HTMLElement | null;

                                if (fallback) {
                                  fallback.style.display = 'flex';
                                }
                              }}
                            />

                            <div className="sdhs-volunteer-photo-fallback">
                              No Image
                            </div>
                          </div>
                        </td>

                        <td className="fw-semibold">{row.volunteerId}</td>

                        <td>{row.volunteerName}</td>

                        <td>{row.centerCode}</td>

                        <td>{row.age ?? '-'}</td>

                        <td>{row.phone || '-'}</td>

                        <td>{row.eventName}</td>

                        <td>
                          <span className="badge bg-primary">
                            {row.participantStatus}
                          </span>
                        </td>

                        <td>
                          <span className="badge bg-success">
                            {row.paymentStatus || 'NA'}
                          </span>
                        </td>

                        <td>
                          {row.accommodationRequired ? 'YES' : 'NO'}
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
    </div>
  );
}