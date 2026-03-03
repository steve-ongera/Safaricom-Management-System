const PAGE_TITLES = {
  dashboard: 'Dashboard',
  employees: 'Employees',
  departments: 'Departments',
  payments: 'Payments',
};

export default function Navbar({ currentPage, onMenuToggle }) {
  const now = new Date().toLocaleDateString('en-KE', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric'
  });

  return (
    <nav className="navbar">
      <div className="navbar-left">
        <button className="btn-icon menu-toggle" onClick={onMenuToggle} title="Toggle Sidebar">
          <i className="bi bi-list"></i>
        </button>
        <div>
          <div className="page-title">{PAGE_TITLES[currentPage] || 'Dashboard'}</div>
          <div className="page-breadcrumb">{now}</div>
        </div>
      </div>

      <div className="navbar-right">
        <button className="btn-icon" title="Notifications">
          <i className="bi bi-bell"></i>
        </button>
        <button className="btn-icon" title="Settings">
          <i className="bi bi-gear"></i>
        </button>
      </div>
    </nav>
  );
}