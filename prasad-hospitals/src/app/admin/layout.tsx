import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { AdminShell } from '@/components/admin/admin-shell';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const headerStore = await headers();
  const pathname = headerStore.get('x-pathname') ?? '';
  const isLoginPage = pathname === '/admin/login';

  if (!isLoginPage) {
    const cookieStore = await cookies();
    const token = cookieStore.get('vip_token')?.value;
    if (!token) redirect('/admin/login');
  }

  // Login page renders without the shell
  if (isLoginPage) return <>{children}</>;

  return <AdminShell>{children}</AdminShell>;
}
