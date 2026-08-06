export interface Customer {
  id: number;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  totalSpent: number;
  totalPurchases: number;
  loyaltyPoints: number;
  pointsPerDollar: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
