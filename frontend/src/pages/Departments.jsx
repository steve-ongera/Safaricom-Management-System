import { useState, useEffect, useCallback } from 'react';
import { departmentsApi } from '../services/api';
import ConfirmModal from '../components/ConfirmModal';

const EMPTY_FORM = { name: '', code: '', description: '', head: '' };

export default function Departments() {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [modal, setModal] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchDepts = useCallback(async () => {
    setLoading(true);
    try {
      let params = `?page=${page}`;
      if (search) params += `&search=${encodeURIComponent(search)}`;
      const data = await departmentsApi.list(params);
      setDepartments(data.results || []);
      setTotalPages(Math.ceil((data.count || 0) / 10));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  }, [page, search]);

  useEffect(() => { fetchDepts(); }, [fetchDepts]);

  const openCreate = () => { setForm(EMPTY_FORM); setFormError(''); setModal('create'); };
  const openEdit = (dept) => {
    setForm({ name: dept.name, code: dept.code, description: dept.description || '', head: dept.head || '', _id: dept.id });
    setFormError('');
    setModal('edit');
  };

  const handleSave = async () => {
    if (!form.name || !form.code) { setFormError('Name and Code are required.'); return; }
    setSaving(true);
    setFormError('');
    try {
      const { _id, ...payload } = form;
      if (modal === 'edit') {
        await departmentsApi.update(_id, payload);
      } else {
        await departmentsApi.create(payload);
      }
      setModal(null);
      fetchDepts();
    } catch (e) {
      const msg = Object.values(e || {}).flat().join('. ') || 'Failed to save.';
      setFormError(msg);
    } finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await departmentsApi.delete(deleteTarget.id);
      setDeleteTarget(null);
      fetchDepts();
    } finally { setDeleting(false); }
  };

  return (
    <div>
      <div className="card">
        <div className="table-toolbar">
          <div className="search-input-wrap">
            <i className="bi bi-search"></i>
            <input
              placeholder="Search departments..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
          <button className="btn btn-primary" onClick={openCreate} style={{ marginLeft: 'auto' }}>
            <i className="bi bi-plus-lg"></i> Add Department
          </button>
        </div>

        <div className="table-responsive">
          {loading ? <div className="spinner"></div> : (
            <table className="data-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Department Name</th>
                  <th>Head</th>
                  <th>Description</th>
                  <th style={{ textAlign: 'center' }}>Employees</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {departments.length === 0 ? (
                  <tr><td colSpan={6}><div className="empty-state"><i className="bi bi-diagram-3"></i><p>No departments found</p></div></td></tr>
                ) : departments.map(dept => (
                  <tr key={dept.id}>
                    <td><span className="badge badge-info">{dept.code}</span></td>
                    <td><strong>{dept.name}</strong></td>
                    <td>{dept.head || <span className="text-muted">—</span>}</td>
                    <td style={{ color: 'var(--saf-muted)', fontSize: 12.5, maxWidth: 200 }}>
                      {dept.description ? dept.description.slice(0, 60) + (dept.description.length > 60 ? '...' : '') : '—'}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span className="badge badge-success">{dept.employee_count}</span>
                    </td>
                    <td>
                      <div className="d-flex gap-8">
                        <button className="btn btn-outline btn-xs" onClick={() => openEdit(dept)} title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button className="btn btn-xs" style={{ background: 'var(--saf-red-light)', color: 'var(--saf-red)', border: 'none' }} onClick={() => setDeleteTarget(dept)} title="Delete">
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
              <span className="modal-title">{modal === 'create' ? 'Add Department' : 'Edit Department'}</span>
              <button className="btn-icon" onClick={() => setModal(null)}><i className="bi bi-x-lg"></i></button>
            </div>
            <div className="modal-body">
              {formError && <div className="alert alert-danger"><i className="bi bi-exclamation-circle"></i>{formError}</div>}
              <div className="form-grid-2">
                <div className="form-group">
                  <label className="form-label">Department Name *</label>
                  <input className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Engineering" />
                </div>
                <div className="form-group">
                  <label className="form-label">Code *</label>
                  <input className="form-control" value={form.code} onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. ENG" maxLength={20} />
                </div>
                <div className="form-group">
                  <label className="form-label">Department Head</label>
                  <input className="form-control" value={form.head} onChange={e => setForm(f => ({ ...f, head: e.target.value }))} placeholder="Full name" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description..." style={{ resize: 'vertical' }} />
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
          message={`Delete "${deleteTarget.name}" department?`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}