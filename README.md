# Safaricom Management System

A full-stack staff management system built with Django REST Framework + React.

## Features
- JWT Authentication (login / logout)
- Dashboard with live stats
- Employees — full CRUD, filters, pagination
- Departments — full CRUD, search
- Payments — full CRUD, type/status filters
- Responsive layout — drawable sidebar on mobile
- Bootstrap Icons

---

## Project Structure

```
safaricom/
├── backend/                   # Django project
│   ├── requirements.txt
│   ├── safaricom_backend/
│   │   ├── settings.py
│   │   └── urls.py
│   └── core/
│       ├── models.py          # Department, Employee, Payment
│       ├── serializers.py
│       ├── views.py           # ViewSets + auth + dashboard
│       ├── urls.py
│       └── management/commands/seed_data.py
│
└── frontend/                  # React + Vite
    ├── index.html             # Bootstrap Icons CDN loaded here
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── App.jsx            # Root, routing logic
        ├── main.jsx
        ├── style/
        │   └── global_style.css
        ├── services/
        │   └── api.js         # All API calls + JWT refresh
        ├── components/
        │   ├── Sidebar.jsx    # Drawable on mobile
        │   ├── Navbar.jsx
        │   └── ConfirmModal.jsx
        └── pages/
            ├── LoginPage.jsx
            ├── Dashboard.jsx
            ├── Employees.jsx
            ├── Departments.jsx
            └── Payments.jsx
```

---

## Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations core
python manage.py migrate

# Seed sample data (creates admin user + 30 employees + 50 payments)
python manage.py seed_data

# Start server
python manage.py runserver
```

**Default login:** `admin` / `admin123`

### API Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/login/ | Login → returns JWT tokens |
| POST | /api/auth/logout/ | Logout (blacklists token) |
| GET | /api/dashboard/ | Stats for dashboard |
| GET/POST | /api/employees/ | List / create employees |
| GET/PUT/PATCH/DELETE | /api/employees/{id}/ | Employee detail CRUD |
| GET/POST | /api/departments/ | List / create departments |
| GET/PUT/PATCH/DELETE | /api/departments/{id}/ | Department CRUD |
| GET/POST | /api/payments/ | List / create payments |
| GET/PUT/PATCH/DELETE | /api/payments/{id}/ | Payment CRUD |

**Query params supported:** `?search=`, `?status=`, `?department=`, `?payment_type=`, `?page=`

---

## Frontend Setup

```bash
cd frontend

npm install
npm run dev        # http://localhost:3000
```

The Vite dev server proxies `/api` → `http://localhost:8000`.

---

## Tech Stack
- **Backend:** Django 4.2, DRF, SimpleJWT, django-cors-headers, SQLite
- **Frontend:** React 18, Vite, plain CSS (no UI lib), Bootstrap Icons