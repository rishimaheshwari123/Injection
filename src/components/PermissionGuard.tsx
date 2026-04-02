import { ReactNode } from 'react';
import { ShieldAlert } from 'lucide-react';

interface PermissionGuardProps {
  children: ReactNode;
  permission: string;
}

export default function PermissionGuard({ children, permission }: PermissionGuardProps) {
  const userStr = localStorage.getItem('user');
  const user = userStr ? JSON.parse(userStr) : null;

  // Super admin has all permissions
  if (user?.role === 'admin' && !user?.isStaff) {
    return <>{children}</>;
  }

  // Check if staff has permission
  if (user?.isStaff && user?.permissions?.[permission]) {
    return <>{children}</>;
  }

  // No permission
  return (
    <div className="flex items-center justify-center h-[calc(100vh-200px)]">
      <div className="text-center">
        <ShieldAlert className="mx-auto h-16 w-16 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
        <p className="text-gray-600">You don't have permission to access this page.</p>
      </div>
    </div>
  );
}
