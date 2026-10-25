import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const HOST = '0.0.0.0';
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Persistent Data Storage Directory
const DATA_DIR = path.resolve(process.cwd(), 'data');
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');
const MENU_FILE = path.join(DATA_DIR, 'menu.json');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'manager_credentials.json');

// Ensure data folder exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export interface MenuItemData {
  id: string;
  name: string;
  category: string;
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

export interface OrderItem {
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
  paymentMethod: 'cod' | 'online' | 'qr';
  items: OrderItem[];
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

export interface ManagerCredentials {
  username: string;
  salt: string;
  passwordHash: string;
}

const DEFAULT_SETTINGS: StoreSettings = {
  isDeliveryActive: true,
  deliveryFee: 0,
  minOrderAmount: 200,
  deliveryEstimateMinutes: '35 – 45 mins',
  currency: '₹',
  deliveryCoverageRadiusKm: 5.0,
  deliveryArea: 'Diphu Local Area (Configured by Manager in Staff Console)',
  minCodSubtotal: 500,
  codFee: 100,
  isCodEnabled: true,
  acceptedPaymentMethods: ['Cash on Delivery (COD)'],
};

// ==========================================
// CREDENTIALS & CRYPTOGRAPHY
// ==========================================

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function initManagerCredentials(): ManagerCredentials {
  try {
    if (fs.existsSync(CREDENTIALS_FILE)) {
      const content = fs.readFileSync(CREDENTIALS_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (err) {
    console.error('Error reading manager credentials:', err);
  }

  // Default credentials: username 'manager', password 'Cafe1911Luxury!'
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = hashPassword('Cafe1911Luxury!', salt);
  const creds: ManagerCredentials = {
    username: 'manager',
    salt,
    passwordHash,
  };

  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving initial manager credentials:', err);
  }

  return creds;
}

let managerCreds = initManagerCredentials();

function saveCredentials(creds: ManagerCredentials) {
  managerCreds = creds;
  try {
    fs.writeFileSync(CREDENTIALS_FILE, JSON.stringify(creds, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving manager credentials:', err);
  }
}

// ==========================================
// DATA ACCESS HELPERS
// ==========================================

function loadSettings(): StoreSettings {
  try {
    if (fs.existsSync(SETTINGS_FILE)) {
      const data = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      return { ...DEFAULT_SETTINGS, ...JSON.parse(data) };
    }
  } catch (err) {
    console.error('Error reading settings, using defaults:', err);
  }
  return { ...DEFAULT_SETTINGS };
}

function saveSettings(settings: StoreSettings) {
  try {
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(settings, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving settings:', err);
  }
}

function loadMenu(): MenuItemData[] {
  try {
    if (fs.existsSync(MENU_FILE)) {
      const data = fs.readFileSync(MENU_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading menu file:', err);
  }
  return [];
}

function saveMenu(menu: MenuItemData[]) {
  try {
    const tempFile = `${MENU_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(menu, null, 2), 'utf-8');
    fs.renameSync(tempFile, MENU_FILE);
  } catch (err) {
    console.error('Error saving menu:', err);
  }
}

function loadOrders(): OrderRecord[] {
  try {
    if (fs.existsSync(ORDERS_FILE)) {
      const data = fs.readFileSync(ORDERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading orders file:', err);
  }
  return [];
}

function saveOrders(orders: OrderRecord[]) {
  try {
    const tempFile = `${ORDERS_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(orders, null, 2), 'utf-8');
    fs.renameSync(tempFile, ORDERS_FILE);
  } catch (err) {
    console.error('Error saving orders:', err);
  }
}

// In-Memory Active Manager Sessions
interface StaffSession {
  token: string;
  createdAt: number;
  username: string;
}

const activeSessions: Map<string, StaffSession> = new Map();

// Staff Auth Middleware
function requireStaffAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized: Staff credentials required.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);
  if (!session) {
    res.status(401).json({ error: 'Unauthorized: Session invalid or expired.' });
    return;
  }

  // Session valid for 12 hours
  const SESSION_MAX_AGE_MS = 12 * 60 * 60 * 1000;
  if (Date.now() - session.createdAt > SESSION_MAX_AGE_MS) {
    activeSessions.delete(token);
    res.status(401).json({ error: 'Session expired. Please log in again.' });
    return;
  }

  next();
}

// Recent order submissions cache to prevent duplicate submissions
const recentSubmissions: Array<{ phone: string; hash: string; timestamp: number }> = [];

// ==========================================
// PUBLIC API ROUTES
// ==========================================

// 1. Get Store Configuration
app.get('/api/config', (_req: Request, res: Response) => {
  const settings = loadSettings();
  res.json({
    isDeliveryActive: settings.isDeliveryActive,
    deliveryFee: settings.deliveryFee,
    minOrderAmount: settings.minOrderAmount,
    deliveryEstimateMinutes: settings.deliveryEstimateMinutes,
    currency: settings.currency,
    deliveryCoverageRadiusKm: settings.deliveryCoverageRadiusKm,
    deliveryArea: settings.deliveryArea,
    minCodSubtotal: settings.minCodSubtotal,
    codFee: settings.codFee,
    isCodEnabled: settings.isCodEnabled,
    acceptedPaymentMethods: settings.acceptedPaymentMethods,
  });
});

// 2. Get Live Menu Items with Authoritative Prices
app.get('/api/menu', (_req: Request, res: Response) => {
  const menu = loadMenu();
  res.json({
    items: menu,
  });
});

// 3. Submit Customer Order with STRICT Server-Side Price & COD Validation
app.post('/api/orders', (req: Request, res: Response) => {
  try {
    const {
      customerName,
      contactNumber,
      fulfilmentMethod,
      paymentMethod = 'cod',
      deliveryAddress,
      landmark,
      orderNotes,
      items,
      isDemoOrder,
    } = req.body;

    // Validate customer name
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      res.status(400).json({ error: 'Please provide a valid customer name (at least 2 characters).' });
      return;
    }

    // Validate contact number
    if (!contactNumber || typeof contactNumber !== 'string' || contactNumber.trim().length < 6) {
      res.status(400).json({ error: 'Please provide a valid contact telephone number.' });
      return;
    }

    // Validate fulfilment method
    if (fulfilmentMethod !== 'delivery' && fulfilmentMethod !== 'pickup') {
      res.status(400).json({ error: 'Fulfilment method must be "delivery" or "pickup".' });
      return;
    }

    const settings = loadSettings();

    // Validate delivery address if delivery chosen
    if (fulfilmentMethod === 'delivery') {
      if (!settings.isDeliveryActive) {
        res.status(400).json({ error: 'Delivery service is currently paused by the café salon.' });
        return;
      }
      if (!deliveryAddress || typeof deliveryAddress !== 'string' || deliveryAddress.trim().length < 5) {
        res.status(400).json({ error: 'Please provide a complete delivery address.' });
        return;
      }
    }

    // Validate items array
    if (!Array.isArray(items) || items.length === 0) {
      res.status(400).json({ error: 'Order must contain at least one item.' });
      return;
    }

    // Fetch live canonical menu from disk
    const currentMenu = loadMenu();
    const menuMap = new Map<string, MenuItemData>();
    currentMenu.forEach(item => menuMap.set(item.id, item));

    // Calculate validated server-side items and totals
    const validatedItems: OrderItem[] = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item || !item.id || typeof item.id !== 'string') {
        res.status(400).json({ error: 'Invalid item structure in order.' });
        return;
      }

      const canonical = menuMap.get(item.id);
      if (!canonical) {
        res.status(400).json({ error: `Item "${item.id}" is not available in our current catalog.` });
        return;
      }

      if (canonical.isAvailable === false) {
        res.status(400).json({ error: `"${canonical.name}" is currently marked as unavailable.` });
        return;
      }

      const quantity = Math.floor(Number(item.quantity));
      if (isNaN(quantity) || quantity < 1 || quantity > 50) {
        res.status(400).json({ error: `Invalid quantity for "${canonical.name}". Quantity must be between 1 and 50.` });
        return;
      }

      // Always use canonical price from trusted server - NEVER browser submitted price!
      const unitPrice = canonical.price;
      const itemTotal = Number((unitPrice * quantity).toFixed(2));
      calculatedSubtotal += itemTotal;

      validatedItems.push({
        id: canonical.id,
        name: canonical.name,
        unitPrice,
        quantity,
        itemTotal,
      });
    }

    calculatedSubtotal = Number(calculatedSubtotal.toFixed(2));

    // Check minimum order amount for delivery
    if (fulfilmentMethod === 'delivery' && calculatedSubtotal < settings.minOrderAmount) {
      res.status(400).json({
        error: `Minimum food order for delivery is ${settings.currency}${settings.minOrderAmount}. Your current food subtotal is ${settings.currency}${calculatedSubtotal}.`,
      });
      return;
    }

    // ==========================================
    // PAYMENT METHOD & COD SERVER VALIDATION
    // ==========================================
    let calculatedCodFee = 0;

    if (paymentMethod === 'online' || paymentMethod === 'qr') {
      res.status(400).json({
        error: `${paymentMethod === 'online' ? 'Online Payment (Cards, NetBanking, UPI)' : 'QR Payment'} is coming soon and currently unavailable. Please select Cash on Delivery.`,
      });
      return;
    }

    if (paymentMethod === 'cod') {
      if (!settings.isCodEnabled) {
        res.status(400).json({
          error: 'Cash on Delivery is currently disabled by café management.',
        });
        return;
      }

      // Rule: Do not offer Cash on Delivery for food subtotals below ₹500
      if (calculatedSubtotal < settings.minCodSubtotal) {
        res.status(400).json({
          error: `Cash on Delivery is not available for orders with a food subtotal under ${settings.currency}${settings.minCodSubtotal}. Your current food subtotal is ${settings.currency}${calculatedSubtotal}. Please add ${settings.currency}${settings.minCodSubtotal - calculatedSubtotal} more to qualify for Cash on Delivery.`,
        });
        return;
      }

      // Rule: For Cash on Delivery orders with a food subtotal of ₹500 or more, add a temporary ₹100 COD fee
      calculatedCodFee = settings.codFee;
    } else {
      res.status(400).json({ error: 'Invalid payment method selected.' });
      return;
    }

    // Server-side delivery fee calculation
    const calculatedDeliveryFee = fulfilmentMethod === 'delivery' ? settings.deliveryFee : 0;
    const calculatedTotal = Number((calculatedSubtotal + calculatedDeliveryFee + calculatedCodFee).toFixed(2));

    // Prevent accidental duplicate submission within 15 seconds
    const submissionSignature = `${contactNumber}_${validatedItems.map(i => `${i.id}x${i.quantity}`).join('_')}`;
    const now = Date.now();
    const isDuplicate = recentSubmissions.some(
      sub => sub.phone === contactNumber && sub.hash === submissionSignature && now - sub.timestamp < 15000
    );

    if (isDuplicate) {
      res.status(429).json({
        error: 'A duplicate order with identical items was submitted moments ago. Please wait a moment before submitting again.',
      });
      return;
    }

    recentSubmissions.push({ phone: contactNumber, hash: submissionSignature, timestamp: now });
    if (recentSubmissions.length > 50) {
      recentSubmissions.splice(0, recentSubmissions.length - 20);
    }

    // Generate unique order ID: e.g. ORD-1911-7X9K
    const randomHex = crypto.randomBytes(2).toString('hex').toUpperCase();
    const orderId = `ORD-1911-${randomHex}`;

    const newOrder: OrderRecord = {
      id: orderId,
      createdAt: new Date().toISOString(),
      createdAtEpoch: now,
      updatedAt: new Date().toISOString(),
      status: 'New',
      statusHistory: [
        {
          status: 'New',
          timestamp: new Date().toISOString(),
          note: 'Order placed by customer and logged into salon management system.',
        },
      ],
      customerName: customerName.trim(),
      contactNumber: contactNumber.trim(),
      deliveryAddress: fulfilmentMethod === 'delivery' ? (deliveryAddress || '').trim() : 'Salon Collection (The Heritage Promenade, Janpath)',
      landmark: (landmark || '').trim(),
      orderNotes: (orderNotes || '').trim(),
      fulfilmentMethod,
      paymentMethod,
      items: validatedItems,
      subtotal: calculatedSubtotal,
      deliveryFee: calculatedDeliveryFee,
      codFee: calculatedCodFee,
      total: calculatedTotal,
      currency: settings.currency,
      isDemoOrder: Boolean(isDemoOrder),
    };

    // Save to server-side orders store
    const allOrders = loadOrders();
    allOrders.unshift(newOrder);
    saveOrders(allOrders);

    // Return confirmed order response
    res.status(201).json({
      success: true,
      message: 'Order successfully recorded and confirmed by salon kitchen.',
      order: {
        id: newOrder.id,
        status: newOrder.status,
        createdAt: newOrder.createdAt,
        customerName: newOrder.customerName,
        fulfilmentMethod: newOrder.fulfilmentMethod,
        paymentMethod: newOrder.paymentMethod,
        items: newOrder.items,
        subtotal: newOrder.subtotal,
        deliveryFee: newOrder.deliveryFee,
        codFee: newOrder.codFee,
        total: newOrder.total,
        currency: newOrder.currency,
        isDemoOrder: newOrder.isDemoOrder,
        deliveryEstimateMinutes: settings.deliveryEstimateMinutes,
      },
    });
  } catch (error) {
    console.error('Error processing order submission:', error);
    res.status(500).json({ error: 'An unexpected internal error occurred while recording your order.' });
  }
});

// 4. Customer Order Tracking (Sanitized view by Order ID)
app.get('/api/orders/:id/tracking', (req: Request, res: Response) => {
  const { id } = req.params;
  const allOrders = loadOrders();
  const order = allOrders.find(o => o.id.toUpperCase() === id.toUpperCase());

  if (!order) {
    res.status(404).json({ error: 'Order not found with the specified reference.' });
    return;
  }

  // Return public sanitized tracking without leaking full private database data
  res.json({
    id: order.id,
    status: order.status,
    statusHistory: order.statusHistory,
    createdAt: order.createdAt,
    fulfilmentMethod: order.fulfilmentMethod,
    paymentMethod: order.paymentMethod,
    subtotal: order.subtotal,
    deliveryFee: order.deliveryFee,
    codFee: order.codFee,
    total: order.total,
    currency: order.currency,
    items: order.items.map(i => ({ name: i.name, quantity: i.quantity, unitPrice: i.unitPrice, itemTotal: i.itemTotal })),
    isDemoOrder: order.isDemoOrder,
  });
});

// ==========================================
// SECURE MANAGER AUTHENTICATION & MANAGEMENT
// ==========================================

// 5. Manager Login
app.post('/api/staff/login', (req: Request, res: Response) => {
  const { username, password } = req.body;

  if (!password || typeof password !== 'string') {
    res.status(400).json({ error: 'Manager password required.' });
    return;
  }

  // Check username match (case-insensitive)
  const inputUsername = (username || 'manager').trim();
  const expectedUsername = managerCreds.username;

  if (inputUsername.toLowerCase() !== expectedUsername.toLowerCase()) {
    setTimeout(() => {
      res.status(401).json({ error: 'Invalid manager credentials. Access denied.' });
    }, 300);
    return;
  }

  // Check password hash
  const computedHash = hashPassword(password, managerCreds.salt);
  if (computedHash !== managerCreds.passwordHash) {
    setTimeout(() => {
      res.status(401).json({ error: 'Invalid manager credentials. Access denied.' });
    }, 300);
    return;
  }

  // Generate cryptographically secure session token
  const token = crypto.randomBytes(32).toString('hex');
  activeSessions.set(token, {
    token,
    createdAt: Date.now(),
    username: expectedUsername,
  });

  res.json({
    success: true,
    token,
    user: {
      role: 'manager',
      username: expectedUsername,
      name: 'Salon Manager',
    },
  });
});

// 6. Check Active Manager Session
app.get('/api/staff/session', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const token = authHeader.split(' ')[1];
  const session = activeSessions.get(token);

  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }

  res.json({
    authenticated: true,
    user: {
      role: 'manager',
      username: session.username,
    },
  });
});

// 7. Change Manager Credentials (PROTECTED)
app.post('/api/staff/credentials', requireStaffAuth, (req: Request, res: Response) => {
  const { currentPassword, newUsername, newPassword } = req.body;

  if (!currentPassword || typeof currentPassword !== 'string') {
    res.status(400).json({ error: 'Current password is required to update credentials.' });
    return;
  }

  const computedHash = hashPassword(currentPassword, managerCreds.salt);
  if (computedHash !== managerCreds.passwordHash) {
    res.status(403).json({ error: 'Current password verification failed.' });
    return;
  }

  if (newPassword && (typeof newPassword !== 'string' || newPassword.length < 6)) {
    res.status(400).json({ error: 'New password must be at least 6 characters.' });
    return;
  }

  const updatedUsername = newUsername && typeof newUsername === 'string' && newUsername.trim().length >= 3
    ? newUsername.trim()
    : managerCreds.username;

  let updatedSalt = managerCreds.salt;
  let updatedHash = managerCreds.passwordHash;

  if (newPassword) {
    updatedSalt = crypto.randomBytes(16).toString('hex');
    updatedHash = hashPassword(newPassword, updatedSalt);
  }

  saveCredentials({
    username: updatedUsername,
    salt: updatedSalt,
    passwordHash: updatedHash,
  });

  res.json({
    success: true,
    message: 'Manager credentials updated securely.',
    username: updatedUsername,
  });
});

// 8. Staff Logout
app.post('/api/staff/logout', (req: Request, res: Response) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    activeSessions.delete(token);
  }
  res.json({ success: true, message: 'Logged out successfully.' });
});

// 9. Staff: Get All Orders (PROTECTED)
app.get('/api/staff/orders', requireStaffAuth, (_req: Request, res: Response) => {
  const allOrders = loadOrders();
  res.json({
    orders: allOrders,
  });
});

// 10. Staff: Update Order Status (PROTECTED)
app.patch('/api/staff/orders/:id/status', requireStaffAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, note } = req.body;

  const validStatuses: OrderStatus[] = [
    'New',
    'Accepted',
    'Preparing',
    'Ready',
    'Out for Delivery',
    'Delivered',
    'Cancelled',
    'Pending',
    'Rejected',
  ];

  if (!status || !validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    return;
  }

  const allOrders = loadOrders();
  const index = allOrders.findIndex(o => o.id.toUpperCase() === id.toUpperCase());

  if (index === -1) {
    res.status(404).json({ error: 'Order not found.' });
    return;
  }

  const now = new Date().toISOString();
  allOrders[index].status = status;
  allOrders[index].updatedAt = now;
  allOrders[index].statusHistory.push({
    status,
    timestamp: now,
    note: note ? String(note).trim() : undefined,
  });

  saveOrders(allOrders);

  res.json({
    success: true,
    order: allOrders[index],
  });
});

// 11. Staff: Get Store Settings (PROTECTED)
app.get('/api/staff/settings', requireStaffAuth, (_req: Request, res: Response) => {
  res.json(loadSettings());
});

// 12. Staff: Update Store Settings (PROTECTED)
app.put('/api/staff/settings', requireStaffAuth, (req: Request, res: Response) => {
  const current = loadSettings();
  const {
    isDeliveryActive,
    deliveryFee,
    minOrderAmount,
    deliveryEstimateMinutes,
    currency,
    deliveryCoverageRadiusKm,
    deliveryArea,
    minCodSubtotal,
    codFee,
    isCodEnabled,
    acceptedPaymentMethods,
  } = req.body;

  const updated: StoreSettings = {
    ...current,
    isDeliveryActive: typeof isDeliveryActive === 'boolean' ? isDeliveryActive : current.isDeliveryActive,
    deliveryFee: typeof deliveryFee === 'number' && deliveryFee >= 0 ? Number(deliveryFee.toFixed(2)) : current.deliveryFee,
    minOrderAmount: typeof minOrderAmount === 'number' && minOrderAmount >= 0 ? Number(minOrderAmount.toFixed(2)) : current.minOrderAmount,
    deliveryEstimateMinutes: typeof deliveryEstimateMinutes === 'string' ? deliveryEstimateMinutes.trim() : current.deliveryEstimateMinutes,
    currency: typeof currency === 'string' ? currency.trim() : current.currency,
    deliveryCoverageRadiusKm: typeof deliveryCoverageRadiusKm === 'number' ? deliveryCoverageRadiusKm : current.deliveryCoverageRadiusKm,
    deliveryArea: typeof deliveryArea === 'string' ? deliveryArea.trim() : current.deliveryArea,
    minCodSubtotal: typeof minCodSubtotal === 'number' && minCodSubtotal >= 0 ? Number(minCodSubtotal.toFixed(2)) : current.minCodSubtotal,
    codFee: typeof codFee === 'number' && codFee >= 0 ? Number(codFee.toFixed(2)) : current.codFee,
    isCodEnabled: typeof isCodEnabled === 'boolean' ? isCodEnabled : current.isCodEnabled,
    acceptedPaymentMethods: Array.isArray(acceptedPaymentMethods) ? acceptedPaymentMethods : current.acceptedPaymentMethods,
  };

  saveSettings(updated);
  res.json({ success: true, settings: updated });
});

// 13. Staff: Add Menu Item (PROTECTED)
app.post('/api/staff/menu', requireStaffAuth, (req: Request, res: Response) => {
  const { name, category, description, price, origin, notes, isSignature, image, pairing } = req.body;

  if (!name || typeof name !== 'string' || name.trim().length === 0) {
    res.status(400).json({ error: 'Dish name is required.' });
    return;
  }

  const parsedPrice = Number(price);
  if (isNaN(parsedPrice) || parsedPrice < 0) {
    res.status(400).json({ error: 'Valid price in INR is required.' });
    return;
  }

  const menu = loadMenu();
  const id = `item-${Date.now()}`;
  const newItem: MenuItemData = {
    id,
    name: name.trim(),
    category: category || 'soups',
    description: (description || '').trim(),
    price: parsedPrice,
    origin: origin ? String(origin).trim() : undefined,
    notes: Array.isArray(notes) ? notes : [],
    isSignature: Boolean(isSignature),
    image: image || undefined,
    pairing: pairing ? String(pairing).trim() : undefined,
    isAvailable: true,
    isHidden: false,
  };

  menu.push(newItem);
  saveMenu(menu);

  res.status(201).json({ success: true, item: newItem });
});

// 14. Staff: Update Menu Item (Price, Description, Status, etc.) (PROTECTED)
app.put('/api/staff/menu/:id', requireStaffAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, category, description, price, origin, notes, isSignature, isAvailable, isHidden, image, pairing } = req.body;

  const menu = loadMenu();
  const index = menu.findIndex(item => item.id === id);

  if (index === -1) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  const current = menu[index];
  const updated: MenuItemData = {
    ...current,
    name: name && typeof name === 'string' ? name.trim() : current.name,
    category: category && typeof category === 'string' ? category : current.category,
    description: typeof description === 'string' ? description.trim() : current.description,
    price: typeof price === 'number' && price >= 0 ? Number(price.toFixed(2)) : current.price,
    origin: origin !== undefined ? String(origin).trim() : current.origin,
    notes: Array.isArray(notes) ? notes : current.notes,
    isSignature: typeof isSignature === 'boolean' ? isSignature : current.isSignature,
    isAvailable: typeof isAvailable === 'boolean' ? isAvailable : current.isAvailable !== false,
    isHidden: typeof isHidden === 'boolean' ? isHidden : Boolean(current.isHidden),
    image: typeof image === 'string' ? image : current.image,
    pairing: pairing !== undefined ? String(pairing).trim() : current.pairing,
  };

  menu[index] = updated;
  saveMenu(menu);

  res.json({ success: true, item: updated });
});

// 15. Staff: Delete Menu Item (PROTECTED)
app.delete('/api/staff/menu/:id', requireStaffAuth, (req: Request, res: Response) => {
  const { id } = req.params;
  const menu = loadMenu();
  const filtered = menu.filter(item => item.id !== id);

  if (filtered.length === menu.length) {
    res.status(404).json({ error: 'Menu item not found.' });
    return;
  }

  saveMenu(filtered);
  res.json({ success: true, message: 'Item removed from catalog.' });
});

// ==========================================
// VITE DEV SERVER / STATIC ASSETS
// ==========================================
async function startServer() {
  if (!isProd) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });

    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, HOST, () => {
    console.log(`[CAFE 1911 Server] running on http://${HOST}:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
