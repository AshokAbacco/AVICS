# AVICS Frontend

Accident Vehicle Insurance Claim Management System — frontend application.

## Stack

- React 18 (Vite)
- Tailwind CSS
- React Router DOM
- Lucide React Icons
- Axios
- React Hook Form
- Framer Motion
- Recharts

## Getting Started

```bash
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

Login with any email/password — authentication is a local demo flow, no backend call is required.

## Project Structure

```
src/
  assets/          Static assets
  components/      Reusable UI components (Sidebar, Header, DataTable, Modal, etc.)
  layouts/          AdminLayout, AuthLayout, MainLayout
  hooks/            useTableData, useDisclosure, useAuth
  context/          AuthContext, AppContext
  routes/           AppRoutes.jsx — all route definitions
  services/         Axios instance + API service wrappers
  utils/            Formatting & table helpers
  constants/        Theme, menu, and status constants
  styles/           Global Tailwind styles
  data/             Dummy data for every module
  pages/            One folder per module (Dashboard, Cases, Victims, ...)
```

## Notes

- All data is local dummy data (see `src/data/`) — no backend API calls are required for the UI to function.
- `src/services/api.js` is pre-wired with Axios and an interceptor so it can be pointed at the `backend/` server (`VITE_API_BASE_URL` in `.env`) once real endpoints are implemented.
- Every management page (Cases, Victims, Vehicles, Hospitals, Police, Court, Advocates, Documents, Compensation, Users) shares a common `ManagementPage` component providing search, filter, pagination, add/edit/view/delete modals, and CSV export/import — keeping behavior consistent and the codebase maintainable.
