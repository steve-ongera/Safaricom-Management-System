import { authApi } from '../services/api';

const navItems = [
  { section: 'Main' },
  { label: 'Dashboard', icon: 'bi-speedometer2', path: 'dashboard' },
  { section: 'Management' },
  { label: 'Employees', icon: 'bi-people', path: 'employees' },
  { label: 'Departments', icon: 'bi-diagram-3', path: 'departments' },
  { label: 'Payments', icon: 'bi-credit-card', path: 'payments' },
];

export default function Sidebar({ currentPage, onNavigate, isOpen, onClose }) {
  const user = authApi.getUser();

  const handleLogout = async () => {
    await authApi.logout();
    window.location.href = '/';
  };

  const initials = user
    ? (user.first_name?.[0] || user.username[0]).toUpperCase()
    : 'A';

  return (
    <>
      <div className={`sidebar-overlay ${isOpen ? 'show' : ''}`} onClick={onClose} />

      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">S</div>
          <div>
            <div className="logo-text">Safaricom</div>
            <div className="logo-sub">Management System</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => {
            if (item.section) {
              return (
                <div key={i} className="nav-section-label">{item.section}</div>
              );
            }
            return (
              <button
                key={item.path}
                className={`nav-link ${currentPage === item.path ? 'active' : ''}`}
                onClick={() => { onNavigate(item.path); onClose(); }}
              >
                <i className={`bi ${item.icon}`}></i>
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="user-info" style={{ marginBottom: '12px' }}>
            <div className="user-avatar">{initials}</div>
            <div>
              <div className="user-name">{user?.first_name || user?.username}</div>
              <div className="user-role">Administrator</div>
            </div>
          </div>
          <button
            className="nav-link"
            style={{ padding: '8px 0' }}
            onClick={handleLogout}
          >
            <i className="bi bi-box-arrow-left"></i>
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}