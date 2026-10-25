export type MenuCategoryId =
  | 'soups'
  | 'salads'
  | 'veg_starters'
  | 'non_veg_starters'
  | 'veg_main'
  | 'non_veg_main'
  | 'biryani'
  | 'rice'
  | 'south_indian'
  | 'non_veg_noodles'
  | 'veg_noodles'
  | 'fried_rice'
  | 'snacks'
  | 'accompaniments'
  | 'drinks'
  | 'breads'
  | 'burgers'
  | 'sandwiches'
  | 'rolls'
  | 'momos'
  | string;

export interface MenuItem {
  id: string;
  name: string;
  category: MenuCategoryId;
  description: string;
  price: number;
  origin?: string;
  notes?: string[];
  isSignature?: boolean;
  dietary?: string[];
  image?: string;
  pairing?: string;
  isAvailable?: boolean;
  isHidden?: boolean;
}

export interface CartItem {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  category: string;
  image?: string;
}

export type OrderStatus =
  | 'New'
  | 'Accepted'
  | 'Preparing'
  | 'Ready'
  | 'Out for Delivery'
  | 'Delivered'
  | 'Cancelled'
  | 'Pending'
  | 'Rejected';

export type PaymentMethod = 'cod' | 'online' | 'qr';

export interface OrderItemRecord {
  id: string;
  name: string;
  unitPrice: number;
  quantity: number;
  itemTotal: number;
}

export interface OrderRecord {
  id: string;
  createdAt: string;
  createdAtEpoch: number;
  updatedAt: string;
  status: OrderStatus;
  statusHistory: Array<{ status: OrderStatus; timestamp: string; note?: string }>;
  customerName: string;
  contactNumber: string;
  deliveryAddress: string;
  landmark?: string;
  orderNotes?: string;
  fulfilmentMethod: 'delivery' | 'pickup';
  paymentMethod: PaymentMethod;
  items: OrderItemRecord[];
  subtotal: number;
  deliveryFee: number;
  codFee: number;
  total: number;
  currency: string;
  isDemoOrder: boolean;
}

export interface StoreSettings {
  isDeliveryActive: boolean;
  deliveryFee: number;
  minOrderAmount: number;
  deliveryEstimateMinutes: string;
  currency: string;
  deliveryCoverageRadiusKm: number;
  deliveryArea: string;
  minCodSubtotal: number;
  codFee: number;
  isCodEnabled: boolean;
  acceptedPaymentMethods: string[];
}

export type MenuCategory = {
  id: MenuItem['category'];
  label: string;
  description: string;
};

export interface GalleryItem {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image: string;
  aspect: 'landscape' | 'portrait' | 'wide';
  details: string;
}

export interface AtmosphereMoment {
  id: string;
  title: string;
  timeframe: string;
  description: string;
  sensoryNotes: string[];
  recommendedOrder: string;
}

export interface ReservationData {
  name: string;
  email: string;
  phone: string;
  date: string;
  time: string;
  guests: number;
  seatingArea?: string;
  seatingPreference?: string;
  specialRequests?: string;
}

export interface CafeDetails {
  name: string;
  address: string;
  city: string;
  phone: string;
  phoneNote?: string;
  email?: string;
  weekdayHours: string;
  weekendHours: string;
  currencySymbol: string;
  googleMapsUrl: string;
}

