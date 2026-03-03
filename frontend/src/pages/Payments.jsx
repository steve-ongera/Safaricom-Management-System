import { useState, useEffect, useCallback } from 'react';
import { paymentsApi, employeesApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const EMPTY_FORM = {
  employee: '', payment_type: 'salary', amount: '',
  currency: 'KES', payment_date: '', reference: '', status: 'pending', description: '',
};

const genRef = () => 'PAY-' + Math.random().toString(36).substring(2, 10).toUpperCase();

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      let params = `?page=${page}`;
      if (search) params += `&search=${encodeURIComponent(search)}`;
      if (filterType) params += `&payment_type=${filterType}`;
      if (filterStatus) params += `&status=${filterStatus}`;
      const data = await paymentsApi.list(params);
      setPayments(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, filterType, filterStatus]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);
  useEffect(() => { employeesApi.list('?page_size=200').then(d => setEmployees(d.results || [])); }, []);

  const openCreate = () => {
    setForm({ ...EMPTY_FORM, reference: genRef(), payment_date: new Date().toISOString().slice(0, 10) });
    setFormError('');
    setModal('create');
  };

  const openEdit = (p) => {
    setForm({
      employee: p.employee, payment_type: p.payment_type, amount: p.amount,
      currency: p.currency, payment_date: p.payment_date, reference: p.reference,
      status: p.status, description: p.description || '', _id: p.id,
    });
    setFormError('');
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.employee || !form.amount || !form.payment_date || !form.reference) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const { _id, ...payload } = form;
      if (modal === 'edit') {
        await paymentsApi.update(_id, payload);
      } else {
        await paymentsApi.create(payload);
      }
      setModal(null);
      fetchPayments();
    } catch (e) {
      const msg = Object.values(e || {}).flat().join('. ') || 'Failed to save.';
      setFormError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await paymentsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchPayments();
    } finally { setDeleting(false); }
  };

  const fmt = (n) => new Intl.NumberFormat('en-KE').format(n || 0);

  const statusBadge = (s) => {
    const cls = s === 'processed' ? 'badge-success' : s === 'failed' ? 'badge-danger' : 'badge-warning';
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  const typeBadge = (t) => {
    const cls = t === 'salary' ? 'badge-info' : t === 'bonus' ? 'badge-success' : t === 'deduction' ? 'badge-danger' : 'badge-secondary';
    return <span className={`badge ${cls}`}>{t}</span>;
  };

  return (
    <div>
      <div className="card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <i className="bi bi-search"></i>
            <input
              placeholder="Search by reference or employee..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filterType} onChange={e => { setFilterType(e.target.value); setPage(1); }}>
            <option value="">All Types</option>
            <option value="salary">Salary</option>
            <option value="bonus">Bonus</option>
            <option value="allowance">Allowance</option>
            <option value="deduction">Deduction</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
            <option value="failed">Failed</option>
          </select>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginLeft: 'auto' }}>
            <i className="bi bi-plus-lg"></i> Add Payment
          </button>
        </div>

        <div className="table-responsive">
          {loading ? <div className="spinner"></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Employee</th>
                  <th>Type</th>
                  <th style={{ textAlign: 'right' }}>Amount (KES)</th>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr><td colSpan={7}><div className="empty-state"><i className="bi bi-credit-card"></i><p>No payments found</p></div></td></tr>
                ) : payments.map(p => (
                  <tr key={p.id}>
                    <td><span className="mono" style={{ fontSize: 12 }}>{p.reference}</span></td>
                    <td>
                      <div>
                        <div style={{ fontWeight: 500 }}>{p.employee_name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--saf-muted)' }}>{p.employee_id_code}</div>
                      </div>
                    </td>
                    <td>{typeBadge(p.payment_type)}</td>
                    <td style={{ textAlign: 'right', fontFamily: 'DM Mono, monospace' }}>{fmt(p.amount)}</td>
                    <td style={{ color: 'var(--saf-muted)', fontSize: 12.5 }}>{p.payment_date}</td>
                    <td>{statusBadge(p.status)}</td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn btn-outline btn-xs" onClick={() => openEdit(p)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-xs" style={{ background: 'var(--saf-red-light)', color: 'var(--saf-red)', border: 'none' }} onClick={() => setDeleteTarget(p)} title="Delete">
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {totalPages > 1 && (
          <div className="pagination">
            <button className="page-btn" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}>
              <i className="bi bi-chevron-left"></i>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button key={n} className={`page-btn ${page === n ? 'active' : ''}`} onClick={() => setPage(n)}>{n}</button>
            ))}
            <button className="page-btn" onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <i className="bi bi-chevron-right"></i>
            </button>
          </div>
        )}
      </div>

      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{modal === 'create' ? 'Add Payment' : 'Edit Payment'}</span>
              <button className="btn-icon" onClick={() => setModal(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-danger"><i className="bi bi-exclamation-circle"></i>{formError}</div>}
              <div className="form-grid-2">
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Employee *</label>
                  <select className="form-select" value={form.employee} onChange={e => setForm(f => ({ ...f, employee: e.target.value }))}>
                    <option value="">Select Employee</option>
                    {employees.map(e => <option key={e.id} value={e.id}>{e.full_name} ({e.employee_id})</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Type *</label>
                  <select className="form-select" value={form.payment_type} onChange={e => setForm(f => ({ ...f, payment_type: e.target.value }))}>
                    <option value="salary">Salary</option>
                    <option value="bonus">Bonus</option>
                    <option value="allowance">Allowance</option>
                    <option value="deduction">Deduction</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="pending">Pending</option>
                    <option value="processed">Processed</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Amount *</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Currency</label>
                  <select className="form-select" value={form.currency} onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}>
                    <option value="KES">KES</option>
                    <option value="USD">USD</option>
                    <option value="EUR">EUR</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Payment Date *</label>
                  <input className="form-control" type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reference *</label>
                  <input className="form-control mono" value={form.reference} onChange={e => setForm(f => ({ ...f, reference: e.target.value }))} />
                </div>
                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label className="form-label">Description</label>
                  <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : <><i className="bi bi-check-lg"></i> Save</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <ConfirmModal
          message={`Delete payment ${deleteTarget.reference}?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}