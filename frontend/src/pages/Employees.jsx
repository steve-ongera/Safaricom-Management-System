import { useState, useEffect, useCallback } from 'react';
import { employeesApi, departmentsApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const EMPTY_FORM = {
  employee_id: '', first_name: '', last_name: '', email: '',
  phone: '', gender: '', department: '', job_title: '',
  date_joined: '', status: 'active',
};

export default function Employees() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterDept, setFilterDept] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modal, setModal] = useState(null); // null | 'create' | 'edit'
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      let params = `?page=${page}`;
      if (search) params += `&search=${encodeURIComponent(search)}`;
      if (filterStatus) params += `&status=${filterStatus}`;
      if (filterDept) params += `&department=${filterDept}`;
      const data = await employeesApi.list(params);
      setEmployees(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search, filterStatus, filterDept]);

  useEffect(() => { fetchEmployees(); }, [fetchEmployees]);

  useEffect(() => {
    departmentsApi.list().then(d => setDepartments(d.results || []));
  }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create'); };
  const openEdit = (emp) => {
    setForm({
      employee_id: emp.employee_id, first_name: emp.first_name, last_name: emp.last_name,
      email: emp.email, phone: emp.phone || '', gender: emp.gender || '',
      department: emp.department || '', job_title: emp.job_title,
      date_joined: emp.date_joined, status: emp.status,
      _id: emp.id,
    });
    setFormError('');
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.employee_id || !form.first_name || !form.last_name || !form.email || !form.job_title || !form.date_joined) {
      setFormError('Please fill in all required fields.');
      return;
    }
    setSaving(true);
    setFormError('');
    try {
      const payload = { ...form };
      delete payload._id;
      if (!payload.department) delete payload.department;
      if (modal === 'edit') {
        await employeesApi.update(form._id, payload);
      } else {
        await employeesApi.create(payload);
      }
      setModal(null);
      fetchEmployees();
    } catch (e) {
      const msg = Object.values(e || {}).flat().join('. ') || 'Failed to save.';
      setFormError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await employeesApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchEmployees();
    } finally { setDeleting(false); }
  };

  const statusBadge = (s) => {
    const cls = s === 'active' ? 'badge-success' : s === 'inactive' ? 'badge-secondary' : 'badge-danger';
    return <span className={`badge ${cls}`}>{s}</span>;
  };

  return (
    <div>
      <div className="card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <i className="bi bi-search"></i>
            <input
              placeholder="Search employees..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <select className="form-select" style={{ width: 'auto' }} value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1); }}>
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="suspended">Suspended</option>
          </select>
          <select className="form-select" style={{ width: 'auto' }} value={filterDept} onChange={e => { setFilterDept(e.target.value); setPage(1); }}>
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginLeft: 'auto' }}>
            <i className="bi bi-plus-lg"></i> Add Employee
          </button>
        </div>

        <div className="table-responsive">
          {loading ? <div className="spinner"></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Department</th>
                  <th>Job Title</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.length === 0 ? (
                  <tr><td colSpan={8}><div className="empty-state"><i className="bi bi-people"></i><p>No employees found</p></div></td></tr>
                ) : employees.map(emp => (
                  <tr key={emp.id}>
                    <td><span className="mono" style={{ fontSize: 12 }}>{emp.employee_id}</span></td>
                    <td><strong>{emp.full_name}</strong></td>
                    <td style={{ color: 'var(--saf-muted)', fontSize: 12.5 }}>{emp.email}</td>
                    <td>{emp.department_name || <span className="text-muted">—</span>}</td>
                    <td>{emp.job_title}</td>
                    <td style={{ color: 'var(--saf-muted)', fontSize: 12.5 }}>{emp.date_joined}</td>
                    <td>{statusBadge(emp.status)}</td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn btn-outline btn-xs" onClick={() => openEdit(emp)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-xs" style={{ background: 'var(--saf-red-light)', color: 'var(--saf-red)', border: 'none' }} onClick={() => setDeleteTarget(emp)} title="Delete">
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

      {/* Create/Edit Modal */}
      {modal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <span className="modal-title">{modal === 'create' ? 'Add Employee' : 'Edit Employee'}</span>
              <button className="btn-icon" onClick={() => setModal(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-danger"><i className="bi bi-exclamation-circle"></i>{formError}</div>}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Employee ID *</label>
                  <input className="form-control" value={form.employee_id} onChange={e => setForm(f => ({ ...f, employee_id: e.target.value }))} placeholder="SAF0001" />
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">First Name *</label>
                  <input className="form-control" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Last Name *</label>
                  <input className="form-control" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-control" type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input className="form-control" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+254700000000" />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="form-select" value={form.gender} onChange={e => setForm(f => ({ ...f, gender: e.target.value }))}>
                    <option value="">Select</option>
                    <option value="M">Male</option>
                    <option value="F">Female</option>
                    <option value="O">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Department</label>
                  <select className="form-select" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                    <option value="">Select Department</option>
                    {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Job Title *</label>
                  <input className="form-control" value={form.job_title} onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date Joined *</label>
                  <input className="form-control" type="date" value={form.date_joined} onChange={e => setForm(f => ({ ...f, date_joined: e.target.value }))} />
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
          message={`Delete ${deleteTarget.first_name} ${deleteTarget.last_name}? This will also remove their payment records.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}