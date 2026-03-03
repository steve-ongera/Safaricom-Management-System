import { useState } from 'react';
import { authApi } from './services/api';
import './style/global_style.css';

import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Departments from './pages/Departments';
import Payments from './pages/Payments';

const PAGES = { dashboard: Dashboard, employees: Employees, departments: Departments, payments: Payments };

export default function App() {
  const [authed, setAuthed] = useState(authApi.isAuthenticated());
  const [page, setPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!authed) {
    return <LoginPage onLogin={() => setAuthed(true)} />;
  }

  const PageComponent = PAGES[page] || Dashboard;

  return (
    <div className="app-shell">
      <Sidebar
        currentPage={page}
        onNavigate={setPage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className="main-content">
        <Navbar
          currentPage={page}
          onMenuToggle={() => setSidebarOpen(o => !o)}
        />
        <div className="page-body">
          <PageComponent />
        </div>
      </div>
    </div>
  );
}