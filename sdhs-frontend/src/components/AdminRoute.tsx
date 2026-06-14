import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

type AdminRouteProps = {
  children: ReactNode;
};

function AdminRoute({ children }: AdminRouteProps) {
  const volunteer = JSON.parse(localStorage.getItem('volunteer') || 'null');

  if (!volunteer || volunteer.isAdmin !== true) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default AdminRoute;
