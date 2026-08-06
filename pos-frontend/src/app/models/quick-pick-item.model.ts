export interface QuickPickItem {
  id: number;
  label: string;
  labelKh?: string;
  price: number;
  icon?: string;
  sortOrder: number;
  isActive: boolean;
}
