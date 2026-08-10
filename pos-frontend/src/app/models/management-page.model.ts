export interface ManagementPage {
  id: number;
  title: string;
  titleKm: string;
  icon?: string;
  type?: string;
  url?: string;
  description?: string;
  permissions?: string[];
  badge?: number;
  sortOrder: number;
  isActive: boolean;
  parentId?: number;
  children?: ManagementPage[];
  createdAt: string;
  updatedAt: string;
}
