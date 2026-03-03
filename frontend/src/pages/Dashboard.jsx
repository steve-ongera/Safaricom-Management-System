import { useState, useEffect } from 'react';
import { dashboardApi } from '../services/api';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dashboardApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="spinner"></div>;

  const fmt = (n) => new Intl.NumberFormat('en-KE').format(n || 0);

  return (
    <div>
      <div className="stat-grid">
        <div className="stat-card">
          <div className="stat-icon green"><i className="bi bi-people"></i></div>
          <div>
            <div className="stat-label">Active Employees</div>
            <div className="stat-value">{fmt(stats?.total_employees)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue"><i className="bi bi-diagram-3"></i></div>
          <div>
            <div className="stat-label">Departments</div>
            <div className="stat-value">{fmt(stats?.total_departments)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green"><i className="bi bi-cash-stack"></i></div>
          <div>
            <div className="stat-label">Total Paid (KES)</div>
            <div className="stat-value" style={{ fontSize: 18 }}>{fmt(stats?.total_payments)}</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon orange"><i className="bi bi-hourglass-split"></i></div>
          <div>
            <div className="stat-label">Pending Payments</div>
            <div className="stat-value">{fmt(stats?.pending_payments)}</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Department Breakdown */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><i className="bi bi-diagram-3 me-2"></i>Department Headcount</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats?.department_breakdown?.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Department</th>
                    <th style={{ textAlign: 'right' }}>Employees</th>
                    <th style={{ textAlign: 'right' }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.department_breakdown.map((d, i) => {
                    const pct = stats.total_employees > 0
                      ? Math.round((d.count / stats.total_employees) * 100)
                      : 0;
                    return (
                      <tr key={i}>
                        <td>{d.name}</td>
                        <td style={{ textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{d.count}</td>
                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                            <div style={{ width: 60, height: 6, background: '#e5e7eb', borderRadius: 3 }}>
                              <div style={{ width: `${pct}%`, height: '100%', background: 'var(--saf-green)', borderRadius: 3 }}></div>
                            </div>
                            <span style={{ fontSize: 12, color: 'var(--saf-muted)', minWidth: 30 }}>{pct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="empty-state"><i className="bi bi-inbox"></i><p>No data</p></div>
            )}
          </div>
        </div>

        {/* Recent Payments */}
        <div className="card">
          <div className="card-header">
            <span className="card-title"><i className="bi bi-credit-card me-2"></i>Recent Payments</span>
          </div>
          <div className="card-body" style={{ padding: 0 }}>
            {stats?.recent_payments?.length ? (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Type</th>
                    <th style={{ textAlign: 'right' }}>Amount (KES)</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.recent_payments.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontSize: 12.5 }}>{p.employee_name}</td>
                      <td><span className="badge badge-info">{p.payment_type}</span></td>
                      <td style={{ textAlign: 'right', fontFamily: 'DM Mono, monospace', fontSize: 12.5 }}>
                        {fmt(p.amount)}
                      </td>
                      <td>
                        <span className={`badge badge-${p.status === 'processed' ? 'success' : p.status === 'failed' ? 'danger' : 'warning'}`}>
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="empty-state"><i className="bi bi-inbox"></i><p>No payments</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}