export interface UserRoleItem {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'cashier';
  status: 'active' | 'inactive';
  avatarUrl?: string;
}