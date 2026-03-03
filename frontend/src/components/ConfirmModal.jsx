export default function ConfirmModal({ title, message, onConfirm, onCancel, loading }) {
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 400 }}>
        <div className="modal-header">
          <span className="modal-title" style={{ color: 'var(--saf-red)' }}>
            <i className="bi bi-exclamation-triangle me-2"></i>
            {title || 'Confirm Delete'}
          </span>
          <button className="btn-icon" onClick={onCancel}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ color: 'var(--saf-muted)', fontSize: 13.5 }}>
            {message || 'Are you sure you want to delete this record? This action cannot be undone.'}
          </p>
        </div>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={onCancel} disabled={loading}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <><span className="spinner" style={{ width: 14, height: 14, margin: 0, borderWidth: 2 }} /> Deleting...</> : <><i className="bi bi-trash"></i> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}