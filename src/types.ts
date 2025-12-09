
export interface Product {
  id: number | string;
  storeId: string; // Link product to a specific store
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  unit: string;
}

export interface ProductOrder {
  product: Product;
  quantity: number;
}

export interface CustomerDetails {
  name: string;
  address: string;
  contact: string;
}

export type OrderStatus = 'pending' | 'paid' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';

export interface OrderDetails {
  firestoreId?: string; 
  storeId: string; // Link order to a specific store
  userId?: string; 
  customer: CustomerDetails;
  products: ProductOrder[];
  totalAmount: number;
  orderId: string;
  status: OrderStatus;
  trackingNumber?: string;
  paymentId?: string; 
  createdAt?: any;
}

export interface UpiDetails {
  vpa: string;
  payeeName: string;
  amount: number;
  transactionNote: string;
  transactionRef: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
  role: 'root' | 'seller' | 'customer'; // Updated roles
  managedStoreId?: string; // If role is seller, which store do they own?
  avatar?: string;
}

export interface Store {
  storeId: string; // Unique URL slug (e.g., 'teja-shop')
  name: string;
  ownerEmail?: string;
  ownerPhone?: string;
  vpa: string;
  merchantName: string; // For UPI context
  createdAt: any;
}

export interface StoreSettings {
    merchantVpa: string;
    merchantName: string;
}

export type View = 'landing' | 'customer' | 'admin' | 'root-dashboard';
