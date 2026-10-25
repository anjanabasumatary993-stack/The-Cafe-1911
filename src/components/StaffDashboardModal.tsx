import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { OrderRecord, OrderStatus, StoreSettings, MenuItem } from '../types';
import { MENU_CATEGORIES } from '../data/cafeData';
import { StaffSecurityGuideModal } from './StaffSecurityGuideModal';
import { updateFirestoreOrderStatus } from '../firebase/orders';
import {
  X,
  Lock,
  LogOut,
  RefreshCw,
  Clock,
  MapPin,
  Phone,
  User as UserIcon,
  CheckCircle,
  CheckCircle2,
  AlertTriangle,
  Truck,
  Store,
  Sliders,
  FileText,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit2,
  Plus,
  Save,
  KeyRound,
  ShieldCheck,
  Banknote,
  DollarSign,
  Check,
  Ban,
  Flame,
} from 'lucide-react';

interface StaffDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSettingsUpdated?: () => void;
  onMenuUpdated?: () => void;
}

export const StaffDashboardModal: React.FC<StaffDashboardModalProps> = ({
  isOpen,
  onClose,
  onSettingsUpdated,
  onMenuUpdated,
}) => {
  // Security Guide Modal state
  const [isSecurityGuideOpen, setIsSecurityGuideOpen] = useState(false);

  // Authentication State
  const [authToken, setAuthToken] = useState<string | null>(() => {
    return sessionStorage.getItem('cafe1911_staff_token');
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'orders' | 'menu' | 'settings' | 'credentials'>('orders');

  // Orders State
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);
  const [statusUpdateNote, setStatusUpdateNote] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<OrderRecord | null>(null);
  const [cancellationReason, setCancellationReason] = useState<string>('Item out of stock');
  const [customReason, setCustomReason] = useState<string>('');

  // Menu Management State
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoadingMenu, setIsLoadingMenu] = useState(false);
  const [menuSearchQuery, setMenuSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all');
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isSavingMenu, setIsSavingMenu] = useState(false);
  const [isAddingNewItem, setIsAddingNewItem] = useState(false);
  const [newItemForm, setNewItemForm] = useState({
    name: '',
    category: 'soups',
    description: '',
    price: 200,
    origin: '',
    pairing: '',
  });

  // Settings State
  const [settingsForm, setSettingsForm] = useState<StoreSettings>({
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
  });
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSuccessMessage, setSettingsSuccessMessage] = useState<string | null>(null);

  // Manager Credentials State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [credError, setCredError] = useState<string | null>(null);
  const [credSuccess, setCredSuccess] = useState<string | null>(null);
  const [isUpdatingCreds, setIsUpdatingCreds] = useState(false);

  // Load Data on Open or Auth
  useEffect(() => {
    if (isOpen && authToken) {
      loadAllData();
    }
  }, [isOpen, authToken]);

  const loadAllData = async () => {
    if (!authToken) return;
    await Promise.all([loadOrders(), loadSettings(), loadMenu()]);
  };

  const loadOrders = async () => {
    if (!authToken) return;
    setIsLoadingOrders(true);
    try {
      const res = await fetch('/api/staff/orders', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
      } else if (res.status === 401) {
        handleLogout();
      }
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setIsLoadingOrders(false);
    }
  };

  const loadSettings = async () => {
    if (!authToken) return;
    try {
      const res = await fetch('/api/staff/settings', {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setSettingsForm(data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  };

  const loadMenu = async () => {
    setIsLoadingMenu(true);
    try {
      const res = await fetch('/api/menu');
      if (res.ok) {
        const data = await res.json();
        setMenuItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load menu:', err);
    } finally {
      setIsLoadingMenu(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsLoggingIn(true);

    try {
      const res = await fetch('/api/staff/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: usernameInput || 'manager',
          password: passwordInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Invalid credentials.');
      }

      setAuthToken(data.token);
      sessionStorage.setItem('cafe1911_staff_token', data.token);
      setPasswordInput('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setLoginError(err.message);
      } else {
        setLoginError('Authentication failed.');
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await fetch('/api/staff/logout', {
          method: 'POST',
          headers: { Authorization: `Bearer ${authToken}` },
        });
      } catch {}
    }
    setAuthToken(null);
    sessionStorage.removeItem('cafe1911_staff_token');
    setOrders([]);
    setSelectedOrder(null);
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: OrderStatus,
    customNote?: string
  ) => {
    if (!authToken) return;
    setIsUpdatingStatus(true);
    const noteText = customNote || statusUpdateNote || `Status updated to ${newStatus}`;

    // Optimistic UI update
    const nowIso = new Date().toISOString();
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: newStatus,
            updatedAt: nowIso,
            statusHistory: [
              ...(o.statusHistory || []),
              { status: newStatus, timestamp: nowIso, note: noteText },
            ],
          };
        }
        return o;
      })
    );

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder((prev) =>
        prev
          ? {
              ...prev,
              status: newStatus,
              updatedAt: nowIso,
              statusHistory: [
                ...(prev.statusHistory || []),
                { status: newStatus, timestamp: nowIso, note: noteText },
              ],
            }
          : null
      );
    }

    try {
      // 1. Update on server endpoint
      const res = await fetch(`/api/staff/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          status: newStatus,
          note: noteText,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to update order status');
      }

      const data = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === orderId ? data.order : o)));
      setSelectedOrder(data.order);
      setStatusUpdateNote('');

      // 2. Dual-sync with Firestore
      try {
        if (selectedOrder) {
          await updateFirestoreOrderStatus(orderId, newStatus, selectedOrder, noteText);
        }
      } catch (fErr) {
        console.warn('Direct Firestore update note (order synced via backend):', fErr);
      }

      // 3. Show confirmed toast
      setToastMessage(`Order ${orderId} marked as ${newStatus}`);
      setTimeout(() => setToastMessage(null), 3500);
    } catch (err) {
      console.error('Status update error:', err);
      alert(err instanceof Error ? err.message : 'Error updating status');
    } finally {
      setIsUpdatingStatus(false);
      setCancellingOrder(null);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setIsSavingSettings(true);
    setSettingsSuccessMessage(null);

    try {
      const res = await fetch('/api/staff/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(settingsForm),
      });

      if (!res.ok) {
        throw new Error('Failed to update business settings.');
      }

      setSettingsSuccessMessage('Settings saved successfully and synchronized across salon terminals.');
      if (onSettingsUpdated) onSettingsUpdated();
      setTimeout(() => setSettingsSuccessMessage(null), 4000);
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      }
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveMenuItem = async (item: MenuItem) => {
    if (!authToken) return;
    setIsSavingMenu(true);
    try {
      const res = await fetch(`/api/staff/menu/${item.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(item),
      });

      if (!res.ok) {
        throw new Error('Failed to update menu item.');
      }

      const data = await res.json();
      setMenuItems(prev => prev.map(m => (m.id === item.id ? data.item : m)));
      setEditingItem(null);
      if (onMenuUpdated) onMenuUpdated();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleAddNewMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authToken) return;
    setIsSavingMenu(true);
    try {
      const res = await fetch('/api/staff/menu', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(newItemForm),
      });

      if (!res.ok) {
        throw new Error('Failed to add dish.');
      }

      const data = await res.json();
      setMenuItems(prev => [...prev, data.item]);
      setIsAddingNewItem(false);
      setNewItemForm({
        name: '',
        category: 'signature',
        description: '',
        price: 500,
        origin: '',
        pairing: '',
      });
      if (onMenuUpdated) onMenuUpdated();
    } catch (err: unknown) {
      if (err instanceof Error) alert(err.message);
    } finally {
      setIsSavingMenu(false);
    }
  };

  const handleChangeCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setCredError(null);
    setCredSuccess(null);

    if (newPassword && newPassword !== confirmNewPassword) {
      setCredError('New passwords do not match.');
      return;
    }

    setIsUpdatingCreds(true);
    try {
      const res = await fetch('/api/staff/credentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          currentPassword,
          newUsername: newUsername.trim() || undefined,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update credentials.');
      }

      setCredSuccess('Manager credentials updated securely.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      setNewUsername('');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setCredError(err.message);
      } else {
        setCredError('Failed to update credentials.');
      }
    } finally {
      setIsUpdatingCreds(false);
    }
  };

  if (!isOpen) return null;

  // Filter orders
  const filteredOrders = orders.filter((o) => {
    const matchesFilter = selectedStatusFilter === 'all' || o.status.toLowerCase() === selectedStatusFilter.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      o.contactNumber.includes(searchQuery);
    return matchesFilter && matchesSearch;
  });

  // Filter menu
  const filteredMenu = menuItems.filter((item) => {
    const matchesCat = selectedCategoryFilter === 'all' || item.category === selectedCategoryFilter;
    const matchesSearch =
      !menuSearchQuery ||
      item.name.toLowerCase().includes(menuSearchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(menuSearchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const currencySymbol = settingsForm.currency || '₹';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-hidden">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-[#0c0b0a]/90 backdrop-blur-md"
      />

      {/* Main Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.98, y: 15 }}
        className="relative w-full max-w-6xl h-[94vh] bg-[#14110f] border border-[#2d241e] shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header Bar */}
        <div className="px-6 py-4 border-b border-[#2d241e] bg-[#0c0b0a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded border border-[#c5a880]/40 flex items-center justify-center bg-[#1c1815]">
              <Lock className="w-4 h-4 text-[#c5a880]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                  CAFE 1911 PRIVATE SALON
                </span>
                <span className="px-1.5 py-0.2 bg-[#c5a880]/20 text-[#c5a880] text-[9px] uppercase tracking-wider rounded">
                  Staff Only
                </span>
              </div>
              <h2 className="font-serif text-xl text-[#faf7f2] font-normal">
                Manager Order & Business Console
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsSecurityGuideOpen(true)}
              className="px-2.5 py-1.5 text-xs text-[#c5a880] hover:text-[#faf7f2] border border-[#c5a880]/30 hover:border-[#c5a880] bg-[#1c1815] transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Open Staff Security & Verification Guide"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Security Guide</span>
            </button>

            {authToken && (
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 text-xs text-[#e8e2d5]/70 hover:text-red-300 border border-[#2d241e] hover:border-red-900/50 bg-[#1c1815] transition-colors flex items-center gap-2 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors cursor-pointer"
              aria-label="Close Staff Portal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!authToken ? (
          /* ==========================================
             STAFF AUTHENTICATION LOGIN SCREEN
             ========================================== */
          <div className="flex-1 flex items-center justify-center p-6 bg-[#0c0b0a]/70">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-md p-8 bg-[#14110f] border border-[#2d241e] shadow-xl text-center space-y-6"
            >
              <div className="w-12 h-12 rounded-full border border-[#c5a880]/30 bg-[#1c1815] flex items-center justify-center mx-auto text-[#c5a880]">
                <Lock className="w-5 h-5" />
              </div>

              <div>
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block mb-1">
                  Private Salon Access
                </span>
                <h3 className="font-serif text-2xl text-[#faf7f2] font-normal">
                  Manager Authentication
                </h3>
                <p className="text-xs text-[#e8e2d5]/60 mt-1 font-light">
                  Please enter your authorized manager credentials to access salon orders, live customer records, and menu configuration.
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-1 font-medium">
                    Manager Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="manager"
                    value={usernameInput}
                    onChange={(e) => setUsernameInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-1 font-medium">
                    Access Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-4 py-2.5 bg-[#0c0b0a] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none font-mono"
                  />
                </div>

                {loginError && (
                  <div className="p-3 bg-red-950/40 border border-red-800 text-red-300 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full py-3.5 text-xs uppercase tracking-[0.22em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] transition-all cursor-pointer disabled:opacity-50"
                >
                  {isLoggingIn ? 'Authenticating...' : 'Enter Salon Dashboard'}
                </button>
              </form>

              <div className="text-[11px] text-[#e8e2d5]/40 italic border-t border-[#2d241e] pt-4">
                Staff note: Initial credentials configured: username <code>manager</code> / password <code>Cafe1911Luxury!</code> (changeable in console).
              </div>

              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => setIsSecurityGuideOpen(true)}
                  className="w-full py-2.5 px-3 bg-[#1c1815] hover:bg-[#25201c] border border-[#c5a880]/30 hover:border-[#c5a880] text-xs text-[#c5a880] flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Staff Access & Security Architecture Guide</span>
                </button>
              </div>
            </motion.div>
          </div>
        ) : (
          /* ==========================================
             STAFF DASHBOARD INTERFACE
             ========================================== */
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Top Navigation Tabs */}
            <div className="px-6 py-2 bg-[#1c1815] border-b border-[#2d241e] flex items-center gap-4 text-xs">
              <button
                onClick={() => setActiveTab('orders')}
                className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'orders'
                    ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                    : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Orders ({orders.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('menu')}
                className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'menu'
                    ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                    : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
                }`}
              >
                <DollarSign className="w-3.5 h-3.5" />
                <span>Menu & Dishes ({menuItems.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'settings'
                    ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                    : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                <span>Business & COD Rules</span>
              </button>

              <button
                onClick={() => setActiveTab('credentials')}
                className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer ${
                  activeTab === 'credentials'
                    ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                    : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Manager Credentials</span>
              </button>

              <div className="ml-auto flex items-center gap-2">
                <button
                  onClick={loadAllData}
                  className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors cursor-pointer"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* TAB 1: ORDERS MANAGEMENT */}
            {activeTab === 'orders' && (
              <div className="flex-1 flex overflow-hidden">
                {/* Orders List Sidebar */}
                <div className="w-full md:w-5/12 lg:w-4/12 border-r border-[#2d241e] flex flex-col bg-[#0c0b0a]/40">
                  {/* Filters & Search */}
                  <div className="p-3 border-b border-[#2d241e] space-y-2">
                    <div className="relative">
                      <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#e8e2d5]/40" />
                      <input
                        type="text"
                        placeholder="Search ID, customer, phone..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-1.5 bg-[#14110f] border border-[#2d241e] text-xs text-[#faf7f2] focus:border-[#c5a880] focus:outline-none"
                      />
                    </div>

                    <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px]">
                      {['all', 'New', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'].map((status) => (
                        <button
                          key={status}
                          onClick={() => setSelectedStatusFilter(status)}
                          className={`px-2 py-1 rounded-sm uppercase tracking-wider whitespace-nowrap transition-colors cursor-pointer ${
                            selectedStatusFilter === status
                              ? 'bg-[#c5a880] text-[#0c0b0a] font-medium'
                              : 'bg-[#1c1815] text-[#e8e2d5]/60 hover:text-[#faf7f2]'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Orders List */}
                  <div className="flex-1 overflow-y-auto divide-y divide-[#2d241e]">
                    {isLoadingOrders ? (
                      <div className="p-8 text-center text-xs text-[#e8e2d5]/50">Loading orders...</div>
                    ) : filteredOrders.length === 0 ? (
                      <div className="p-8 text-center text-xs text-[#e8e2d5]/50">No orders match filter.</div>
                    ) : (
                      filteredOrders.map((order) => (
                        <button
                          key={order.id}
                          onClick={() => setSelectedOrder(order)}
                          className={`w-full text-left p-3.5 transition-colors cursor-pointer ${
                            selectedOrder?.id === order.id
                              ? 'bg-[#1c1815] border-l-2 border-[#c5a880]'
                              : 'hover:bg-[#14110f]'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-mono text-xs text-[#c5a880] font-semibold">{order.id}</span>
                            <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider rounded font-medium ${
                              order.status === 'New'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : order.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : order.status === 'Cancelled'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}>
                              {order.status}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-xs text-[#faf7f2]">
                            <span className="font-medium truncate max-w-[150px]">{order.customerName}</span>
                            <span className="font-mono tabular-nums text-[#c5a880]">
                              {order.currency}{order.total.toFixed(2)}
                            </span>
                          </div>

                          <div className="flex items-center justify-between text-[11px] text-[#e8e2d5]/60 mt-1">
                            <span>{order.items.reduce((s, i) => s + i.quantity, 0)} items · {order.fulfilmentMethod}</span>
                            <span>{new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* Order Detail View */}
                <div className="hidden md:flex flex-1 flex-col overflow-y-auto p-6 bg-[#14110f]">
                  {selectedOrder ? (
                    <div className="space-y-6">
                      {/* Top Bar */}
                      <div className="flex items-start justify-between border-b border-[#2d241e] pb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-lg text-[#c5a880] font-semibold">{selectedOrder.id}</span>
                            <span className="text-[10px] uppercase tracking-widest text-[#e8e2d5]/60">
                              Placed {new Date(selectedOrder.createdAt).toLocaleString()}
                            </span>
                          </div>
                          <span className="text-xs text-[#e8e2d5]/60 mt-1 block">
                            Fulfilment: <strong className="text-[#faf7f2] capitalize">{selectedOrder.fulfilmentMethod}</strong> · Payment: <strong className="text-[#faf7f2] uppercase">{selectedOrder.paymentMethod}</strong>
                          </span>
                        </div>

                        <div className="text-right">
                          <span className="text-[10px] uppercase tracking-widest text-[#e8e2d5]/60 block">Grand Total</span>
                          <span className="font-serif text-2xl text-[#c5a880] font-medium tabular-nums">
                            {selectedOrder.currency}{selectedOrder.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Status Action Buttons */}
                      <div className="p-5 bg-[#0c0b0a] border border-[#2d241e] space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] uppercase tracking-[0.2em] text-[#c5a880] font-semibold">
                            Order Lifecycle Workflow
                          </span>
                          <span
                            className={`px-2.5 py-1 text-xs uppercase tracking-wider rounded font-medium ${
                              selectedOrder.status === 'New' || selectedOrder.status === 'Pending'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : selectedOrder.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Rejected'
                                ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                                : 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                            }`}
                          >
                            Current Status: {selectedOrder.status}
                          </span>
                        </div>

                        {/* Primary Action Buttons (Prominent Grid) */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                          {/* 1. Accept Order */}
                          <button
                            type="button"
                            disabled={isUpdatingStatus || selectedOrder.status === 'Accepted'}
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Accepted', 'Staff accepted and confirmed order.')}
                            className={`px-3 py-2.5 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              selectedOrder.status === 'Accepted'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/60'
                                : 'bg-[#1c1815] text-[#faf7f2] border border-[#2d241e] hover:border-amber-500 hover:text-amber-300'
                            }`}
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Accept Order</span>
                          </button>

                          {/* 2. Start Preparing */}
                          <button
                            type="button"
                            disabled={isUpdatingStatus || selectedOrder.status === 'Preparing'}
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Preparing', 'Kitchen commenced food preparation.')}
                            className={`px-3 py-2.5 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              selectedOrder.status === 'Preparing'
                                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/60'
                                : 'bg-[#1c1815] text-[#faf7f2] border border-[#2d241e] hover:border-blue-500 hover:text-blue-300'
                            }`}
                          >
                            <Flame className="w-3.5 h-3.5" />
                            <span>Start Preparing</span>
                          </button>

                          {/* 3. Ready for Pickup */}
                          <button
                            type="button"
                            disabled={isUpdatingStatus || selectedOrder.status === 'Ready'}
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Ready', 'Order packaged and ready at cafe counter.')}
                            className={`px-3 py-2.5 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              selectedOrder.status === 'Ready'
                                ? 'bg-purple-500/20 text-purple-300 border border-purple-500/60'
                                : 'bg-[#1c1815] text-[#faf7f2] border border-[#2d241e] hover:border-purple-500 hover:text-purple-300'
                            }`}
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>Ready for Pickup</span>
                          </button>

                          {/* 4. Out for Delivery */}
                          <button
                            type="button"
                            disabled={isUpdatingStatus || selectedOrder.status === 'Out for Delivery'}
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Out for Delivery', 'Courier dispatched with thermal bag.')}
                            className={`px-3 py-2.5 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              selectedOrder.status === 'Out for Delivery'
                                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/60'
                                : 'bg-[#1c1815] text-[#faf7f2] border border-[#2d241e] hover:border-indigo-500 hover:text-indigo-300'
                            }`}
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Out for Delivery</span>
                          </button>

                          {/* 5. Mark Completed / Delivered */}
                          <button
                            type="button"
                            disabled={isUpdatingStatus || selectedOrder.status === 'Delivered'}
                            onClick={() => handleUpdateOrderStatus(selectedOrder.id, 'Delivered', 'Order completed and handed over to customer.')}
                            className={`px-3 py-2.5 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              selectedOrder.status === 'Delivered'
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/60'
                                : 'bg-[#1c1815] text-[#faf7f2] border border-[#2d241e] hover:border-emerald-500 hover:text-emerald-300'
                            }`}
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Completed / Delivered</span>
                          </button>

                          {/* 6. Cancel / Reject Order */}
                          <button
                            type="button"
                            disabled={isUpdatingStatus || selectedOrder.status === 'Cancelled' || selectedOrder.status === 'Rejected'}
                            onClick={() => setCancellingOrder(selectedOrder)}
                            className="px-3 py-2.5 text-xs uppercase tracking-wider font-medium flex items-center justify-center gap-1.5 bg-red-950/30 text-red-300 border border-red-900/50 hover:bg-red-900/40 hover:border-red-600 transition-all cursor-pointer"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel / Reject Order</span>
                          </button>
                        </div>

                        {/* Manual Status Override & Note */}
                        <div className="pt-2 border-t border-[#2d241e]/60 space-y-2">
                          <div className="flex items-center justify-between text-[10px] uppercase tracking-wider text-[#e8e2d5]/60">
                            <span>Manual Status Override</span>
                            <span>{isUpdatingStatus ? 'Syncing...' : 'Live Synced'}</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {(['New', 'Accepted', 'Preparing', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'] as OrderStatus[]).map((st) => (
                              <button
                                key={st}
                                disabled={isUpdatingStatus || selectedOrder.status === st}
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, st)}
                                className={`px-2 py-1 text-[11px] uppercase tracking-wider border transition-colors cursor-pointer disabled:opacity-40 ${
                                  selectedOrder.status === st
                                    ? 'bg-[#c5a880] text-[#0c0b0a] border-[#c5a880] font-semibold'
                                    : 'border-[#2d241e] bg-[#14110f] text-[#e8e2d5]/70 hover:border-[#c5a880]/50'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>

                          <div className="pt-1 flex gap-2">
                            <input
                              type="text"
                              placeholder="Add custom update note (saved in status history)..."
                              value={statusUpdateNote}
                              onChange={(e) => setStatusUpdateNote(e.target.value)}
                              className="flex-1 px-3 py-1.5 bg-[#14110f] border border-[#2d241e] text-xs text-[#faf7f2] focus:border-[#c5a880] focus:outline-none"
                            />
                            {statusUpdateNote && (
                              <button
                                type="button"
                                onClick={() => handleUpdateOrderStatus(selectedOrder.id, selectedOrder.status, statusUpdateNote)}
                                className="px-3 py-1.5 bg-[#c5a880] text-[#0c0b0a] text-xs uppercase tracking-wider font-semibold cursor-pointer"
                              >
                                Save Note
                              </button>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Customer Contact & Address (PROTECTED) */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-[#0c0b0a] border border-[#2d241e] space-y-2">
                          <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-medium flex items-center gap-1.5">
                            <UserIcon className="w-3.5 h-3.5" /> Customer Identity
                          </span>
                          <p className="text-sm font-serif text-[#faf7f2]">{selectedOrder.customerName}</p>
                          <p className="text-xs text-[#e8e2d5]/80 flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-[#c5a880]" />
                            <a href={`tel:${selectedOrder.contactNumber}`} className="hover:underline">{selectedOrder.contactNumber}</a>
                          </p>
                        </div>

                        <div className="p-4 bg-[#0c0b0a] border border-[#2d241e] space-y-2">
                          <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-medium flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5" /> Delivery Destination
                          </span>
                          <p className="text-xs text-[#faf7f2] leading-relaxed">{selectedOrder.deliveryAddress}</p>
                          {selectedOrder.landmark && (
                            <p className="text-[11px] text-[#e8e2d5]/60 italic">Landmark: {selectedOrder.landmark}</p>
                          )}
                          {selectedOrder.orderNotes && (
                            <p className="text-[11px] text-[#c5a880] pt-1">Notes: {selectedOrder.orderNotes}</p>
                          )}
                        </div>
                      </div>

                      {/* Items Ordered */}
                      <div className="p-4 bg-[#0c0b0a] border border-[#2d241e] space-y-3">
                        <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-medium block">
                          Ordered Culinary Dishes
                        </span>

                        <div className="divide-y divide-[#2d241e] text-xs">
                          {selectedOrder.items.map((item, idx) => (
                            <div key={idx} className="py-2.5 flex items-center justify-between">
                              <div>
                                <span className="font-serif text-[#faf7f2] text-sm">{item.name}</span>
                                <span className="text-[#e8e2d5]/60 block text-[11px]">Qty: {item.quantity} × {selectedOrder.currency}{item.unitPrice.toFixed(2)}</span>
                              </div>
                              <span className="font-mono text-[#faf7f2] tabular-nums font-medium">
                                {selectedOrder.currency}{item.itemTotal.toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {/* Financial Breakdown */}
                        <div className="pt-3 border-t border-[#2d241e] space-y-1.5 text-xs text-[#e8e2d5]/80">
                          <div className="flex justify-between">
                            <span>Food Subtotal</span>
                            <span className="font-mono text-[#faf7f2]">{selectedOrder.currency}{selectedOrder.subtotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Delivery Fee</span>
                            <span className="font-mono text-[#faf7f2]">
                              {selectedOrder.deliveryFee > 0 ? `${selectedOrder.currency}${selectedOrder.deliveryFee.toFixed(2)}` : 'Complimentary'}
                            </span>
                          </div>
                          {selectedOrder.codFee > 0 && (
                            <div className="flex justify-between text-[#c5a880]">
                              <span>Cash on Delivery Handling Fee</span>
                              <span className="font-mono">{selectedOrder.currency}{selectedOrder.codFee.toFixed(2)}</span>
                            </div>
                          )}
                          <div className="pt-2 border-t border-[#2d241e] flex justify-between font-serif text-base text-[#c5a880]">
                            <span>Grand Total</span>
                            <span className="font-mono font-medium">{selectedOrder.currency}{selectedOrder.total.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Order Timeline History */}
                      <div className="p-4 bg-[#0c0b0a] border border-[#2d241e] space-y-2">
                        <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-medium block">
                          Audit Trail & Status History
                        </span>
                        <div className="space-y-2 text-xs">
                          {selectedOrder.statusHistory.map((h, i) => (
                            <div key={i} className="flex items-start gap-2 text-[#e8e2d5]/70">
                              <span className="font-mono text-[10px] text-[#c5a880] shrink-0">
                                {new Date(h.timestamp).toLocaleTimeString()}
                              </span>
                              <span>
                                <strong className="text-[#faf7f2]">{h.status}</strong>: {h.note || 'Status updated by salon manager.'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center text-[#e8e2d5]/40">
                      <FileText className="w-12 h-12 text-[#c5a880]/20 mb-3" />
                      <p className="font-serif text-lg text-[#faf7f2]">No Order Selected</p>
                      <p className="text-xs">Select an incoming order from the left column to view details and update preparation status.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: MENU & DISHES MANAGEMENT */}
            {activeTab === 'menu' && (
              <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-[#14110f] space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#2d241e] pb-4">
                  <div>
                    <h3 className="font-serif text-2xl text-[#faf7f2]">Catalog & Dish Price Management</h3>
                    <p className="text-xs text-[#e8e2d5]/60 mt-0.5">
                      Update prices in Indian Rupees (₹), toggle dish availability, modify descriptions, or add new seasonal creations.
                    </p>
                  </div>

                  <button
                    onClick={() => setIsAddingNewItem(true)}
                    className="px-4 py-2 text-xs uppercase tracking-[0.2em] bg-[#c5a880] text-[#0c0b0a] font-medium hover:bg-[#dfcaa7] transition-colors flex items-center gap-2 cursor-pointer shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add New Dish</span>
                  </button>
                </div>

                {/* Add New Dish Modal / Inline Form */}
                {isAddingNewItem && (
                  <form onSubmit={handleAddNewMenuItem} className="p-5 bg-[#0c0b0a] border border-[#c5a880]/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs uppercase tracking-widest text-[#c5a880] font-semibold">New Dish Creation</span>
                      <button type="button" onClick={() => setIsAddingNewItem(false)} className="text-xs text-[#e8e2d5]/60 hover:text-white">Cancel</button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                      <div>
                        <label className="block text-[#c5a880] mb-1">Dish Name *</label>
                        <input
                          type="text"
                          required
                          value={newItemForm.name}
                          onChange={(e) => setNewItemForm({ ...newItemForm, name: e.target.value })}
                          className="w-full px-3 py-2 bg-[#14110f] border border-[#2d241e] text-[#faf7f2]"
                        />
                      </div>
                      <div>
                        <label className="block text-[#c5a880] mb-1">Category *</label>
                        <select
                          value={newItemForm.category}
                          onChange={(e) => setNewItemForm({ ...newItemForm, category: e.target.value })}
                          className="w-full px-3 py-2 bg-[#14110f] border border-[#2d241e] text-[#faf7f2]"
                        >
                          {MENU_CATEGORIES.map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[#c5a880] mb-1">Price (₹ INR) *</label>
                        <input
                          type="number"
                          required
                          value={newItemForm.price}
                          onChange={(e) => setNewItemForm({ ...newItemForm, price: Number(e.target.value) })}
                          className="w-full px-3 py-2 bg-[#14110f] border border-[#2d241e] text-[#faf7f2]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[#c5a880] text-xs mb-1">Description *</label>
                      <textarea
                        rows={2}
                        value={newItemForm.description}
                        onChange={(e) => setNewItemForm({ ...newItemForm, description: e.target.value })}
                        className="w-full px-3 py-2 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-xs resize-none"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSavingMenu}
                      className="px-5 py-2 text-xs uppercase tracking-widest bg-[#c5a880] text-[#0c0b0a] font-medium hover:bg-[#dfcaa7]"
                    >
                      Save New Dish
                    </button>
                  </form>
                )}

                {/* Filter and Search Bar */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-[#e8e2d5]/40" />
                    <input
                      type="text"
                      placeholder="Search dishes by name or ingredients..."
                      value={menuSearchQuery}
                      onChange={(e) => setMenuSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 bg-[#0c0b0a] border border-[#2d241e] text-xs text-[#faf7f2] focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>

                  <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                    <button
                      onClick={() => setSelectedCategoryFilter('all')}
                      className={`px-3 py-1.5 uppercase tracking-wider rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                        selectedCategoryFilter === 'all'
                          ? 'bg-[#c5a880] text-[#0c0b0a] font-medium'
                          : 'bg-[#0c0b0a] border border-[#2d241e] text-[#e8e2d5]/70 hover:text-[#faf7f2]'
                      }`}
                    >
                      All Dishes
                    </button>
                    {MENU_CATEGORIES.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setSelectedCategoryFilter(cat.id)}
                        className={`px-3 py-1.5 uppercase tracking-wider rounded-sm transition-colors cursor-pointer whitespace-nowrap ${
                          selectedCategoryFilter === cat.id
                            ? 'bg-[#c5a880] text-[#0c0b0a] font-medium'
                            : 'bg-[#0c0b0a] border border-[#2d241e] text-[#e8e2d5]/70 hover:text-[#faf7f2]'
                        }`}
                      >
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Menu Items Table / Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredMenu.map((item) => (
                    <div
                      key={item.id}
                      className={`p-4 bg-[#0c0b0a] border transition-colors ${
                        item.isHidden ? 'opacity-50 border-dashed border-[#2d241e]' : 'border-[#2d241e]'
                      }`}
                    >
                      {editingItem?.id === item.id ? (
                        <div className="space-y-3 text-xs">
                          <div>
                            <label className="text-[#c5a880] text-[10px] uppercase">Name</label>
                            <input
                              type="text"
                              value={editingItem.name}
                              onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                              className="w-full px-2 py-1 bg-[#14110f] border border-[#2d241e] text-[#faf7f2]"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[#c5a880] text-[10px] uppercase">Price (₹)</label>
                              <input
                                type="number"
                                value={editingItem.price}
                                onChange={(e) => setEditingItem({ ...editingItem, price: Number(e.target.value) })}
                                className="w-full px-2 py-1 bg-[#14110f] border border-[#2d241e] text-[#faf7f2]"
                              />
                            </div>
                            <div>
                              <label className="text-[#c5a880] text-[10px] uppercase">Category</label>
                              <select
                                value={editingItem.category}
                                onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as any })}
                                className="w-full px-2 py-1 bg-[#14110f] border border-[#2d241e] text-[#faf7f2]"
                              >
                                {MENU_CATEGORIES.map((c) => (
                                  <option key={c.id} value={c.id}>
                                    {c.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="text-[#c5a880] text-[10px] uppercase">Description</label>
                            <textarea
                              rows={2}
                              value={editingItem.description}
                              onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                              className="w-full px-2 py-1 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] resize-none"
                            />
                          </div>

                          <div className="flex items-center gap-4 pt-1">
                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={editingItem.isAvailable !== false}
                                onChange={(e) => setEditingItem({ ...editingItem, isAvailable: e.target.checked })}
                                className="accent-[#c5a880]"
                              />
                              <span>Available</span>
                            </label>

                            <label className="flex items-center gap-1.5 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={Boolean(editingItem.isHidden)}
                                onChange={(e) => setEditingItem({ ...editingItem, isHidden: e.target.checked })}
                                className="accent-[#c5a880]"
                              />
                              <span>Hide from menu</span>
                            </label>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <button
                              type="button"
                              onClick={() => handleSaveMenuItem(editingItem)}
                              className="flex-1 py-1.5 bg-[#c5a880] text-[#0c0b0a] font-medium text-xs uppercase tracking-wider"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingItem(null)}
                              className="px-3 py-1.5 border border-[#2d241e] text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] uppercase tracking-widest text-[#c5a880] font-mono">
                                {item.id} · {item.category}
                              </span>
                              <h4 className="font-serif text-base text-[#faf7f2] font-normal">{item.name}</h4>
                            </div>
                            <span className="font-serif text-base text-[#c5a880] font-medium tabular-nums">
                              {currencySymbol}{item.price.toFixed(2)}
                            </span>
                          </div>

                          <p className="text-xs text-[#e8e2d5]/70 line-clamp-2 font-light leading-relaxed">
                            {item.description}
                          </p>

                          <div className="pt-2 border-t border-[#2d241e] flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span className={`px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded ${
                                item.isAvailable !== false
                                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/40'
                                  : 'bg-red-950/60 text-red-300 border border-red-800/40'
                              }`}>
                                {item.isAvailable !== false ? 'In Stock' : 'Unavailable'}
                              </span>

                              {item.isHidden && (
                                <span className="px-1.5 py-0.5 text-[9px] uppercase tracking-wider rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
                                  Hidden
                                </span>
                              )}
                            </div>

                            <button
                              onClick={() => setEditingItem(item)}
                              className="p-1.5 text-[#c5a880] hover:text-white transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              <span>Edit</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: BUSINESS & COD RULES */}
            {activeTab === 'settings' && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#14110f] max-w-4xl mx-auto w-full space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block mb-1">
                    Salon Operational Control
                  </span>
                  <h3 className="font-serif text-2xl text-[#faf7f2]">Business, Delivery & Cash on Delivery Rules</h3>
                  <p className="text-xs text-[#e8e2d5]/60 mt-1">
                    Configure server-side minimum thresholds, cash handling surcharges, delivery coverage radius, and active payment policies.
                  </p>
                </div>

                {settingsSuccessMessage && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{settingsSuccessMessage}</span>
                  </div>
                )}

                <form onSubmit={handleSaveSettings} className="space-y-6">
                  {/* Cash on Delivery Rules Box */}
                  <div className="p-6 bg-[#0c0b0a] border border-[#2d241e] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#2d241e] pb-3">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-[#c5a880]" />
                        <h4 className="font-serif text-lg text-[#faf7f2]">Cash on Delivery (COD) Rules</h4>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.isCodEnabled}
                          onChange={(e) => setSettingsForm({ ...settingsForm, isCodEnabled: e.target.checked })}
                          className="w-4 h-4 accent-[#c5a880] rounded cursor-pointer"
                        />
                        <span className="text-xs text-[#faf7f2] font-medium">Enable COD Payment</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[#c5a880] uppercase tracking-wider mb-1 font-medium">
                          Minimum COD Food Subtotal (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settingsForm.minCodSubtotal}
                          onChange={(e) => setSettingsForm({ ...settingsForm, minCodSubtotal: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                        />
                        <span className="text-[11px] text-[#e8e2d5]/60 block mt-1">
                          Orders below this food subtotal will NOT be offered Cash on Delivery. (Default: ₹500)
                        </span>
                      </div>

                      <div>
                        <label className="block text-[#c5a880] uppercase tracking-wider mb-1 font-medium">
                          Temporary COD Handling Fee (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settingsForm.codFee}
                          onChange={(e) => setSettingsForm({ ...settingsForm, codFee: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                        />
                        <span className="text-[11px] text-[#e8e2d5]/60 block mt-1">
                          Added automatically to qualified Cash on Delivery orders. (Default: ₹100)
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery & Logistics Box */}
                  <div className="p-6 bg-[#0c0b0a] border border-[#2d241e] space-y-4">
                    <div className="flex items-center justify-between border-b border-[#2d241e] pb-3">
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#c5a880]" />
                        <h4 className="font-serif text-lg text-[#faf7f2]">Delivery & Logistics Policies</h4>
                      </div>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settingsForm.isDeliveryActive}
                          onChange={(e) => setSettingsForm({ ...settingsForm, isDeliveryActive: e.target.checked })}
                          className="w-4 h-4 accent-[#c5a880] rounded cursor-pointer"
                        />
                        <span className="text-xs text-[#faf7f2] font-medium">Delivery Service Active</span>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div>
                        <label className="block text-[#c5a880] uppercase tracking-wider mb-1 font-medium">
                          Delivery Fee (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settingsForm.deliveryFee}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryFee: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                        />
                        <span className="text-[11px] text-[#e8e2d5]/60 block mt-1">
                          Standard courier delivery charge (Set 0 for complimentary luxury dispatch).
                        </span>
                      </div>

                      <div>
                        <label className="block text-[#c5a880] uppercase tracking-wider mb-1 font-medium">
                          Minimum Order for Delivery (₹) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={settingsForm.minOrderAmount}
                          onChange={(e) => setSettingsForm({ ...settingsForm, minOrderAmount: Number(e.target.value) })}
                          className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                        />
                        <span className="text-[11px] text-[#e8e2d5]/60 block mt-1">
                          Minimum basket subtotal required before checkout can proceed for delivery.
                        </span>
                      </div>

                      <div>
                        <label className="block text-[#c5a880] uppercase tracking-wider mb-1 font-medium">
                          Delivery Zone / Area Description
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsForm.deliveryArea}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryArea: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[#c5a880] uppercase tracking-wider mb-1 font-medium">
                          Estimated Delivery Timeframe
                        </label>
                        <input
                          type="text"
                          required
                          value={settingsForm.deliveryEstimateMinutes}
                          onChange={(e) => setSettingsForm({ ...settingsForm, deliveryEstimateMinutes: e.target.value })}
                          className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingSettings}
                    className="w-full py-4 text-xs uppercase tracking-[0.22em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-all cursor-pointer shadow-lg disabled:opacity-50"
                  >
                    {isSavingSettings ? 'Saving Settings...' : 'Save & Deploy Configuration'}
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: MANAGER CREDENTIALS & SECURITY */}
            {activeTab === 'credentials' && (
              <div className="flex-1 overflow-y-auto p-6 sm:p-8 bg-[#14110f] max-w-xl mx-auto w-full space-y-6">
                <div>
                  <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] block mb-1">
                    Security Governance
                  </span>
                  <h3 className="font-serif text-2xl text-[#faf7f2]">Update Manager Credentials</h3>
                  <p className="text-xs text-[#e8e2d5]/60 mt-1">
                    Securely update your manager username or password. Credentials are encrypted on the server with salted PBKDF2 cryptography and never exposed to the client bundle.
                  </p>
                </div>

                {credSuccess && (
                  <div className="p-3 bg-emerald-950/50 border border-emerald-700 text-emerald-200 text-xs flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{credSuccess}</span>
                  </div>
                )}

                {credError && (
                  <div className="p-3 bg-red-950/50 border border-red-700 text-red-200 text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                    <span>{credError}</span>
                  </div>
                )}

                <form onSubmit={handleChangeCredentials} className="p-6 bg-[#0c0b0a] border border-[#2d241e] space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-1 font-medium">
                      Current Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Current manager password"
                      className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-1 font-medium">
                      New Username (Optional)
                    </label>
                    <input
                      type="text"
                      value={newUsername}
                      onChange={(e) => setNewUsername(e.target.value)}
                      placeholder="e.g. general_manager"
                      className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-1 font-medium">
                      New Password (Optional)
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-[0.2em] text-[#c5a880] mb-1 font-medium">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={confirmNewPassword}
                      onChange={(e) => setConfirmNewPassword(e.target.value)}
                      placeholder="Re-type new password"
                      className="w-full px-4 py-2.5 bg-[#14110f] border border-[#2d241e] text-[#faf7f2] text-sm focus:border-[#c5a880] focus:outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isUpdatingCreds}
                    className="w-full py-3.5 text-xs uppercase tracking-[0.22em] font-medium text-[#0c0b0a] bg-[#c5a880] hover:bg-[#dfcaa7] transition-all cursor-pointer disabled:opacity-50 mt-2"
                  >
                    {isUpdatingCreds ? 'Updating Credentials...' : 'Save New Credentials'}
                  </button>
                </form>
              </div>
            )}
          </div>
        )}

        {/* Real-time Action Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              className="absolute top-16 left-1/2 -translate-x-1/2 z-50 bg-[#1c1815] border border-[#c5a880] text-[#faf7f2] px-5 py-3 shadow-2xl flex items-center gap-3 text-xs"
            >
              <CheckCircle2 className="w-4 h-4 text-[#c5a880] shrink-0" />
              <span className="font-medium">{toastMessage}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Cancellation & Rejection Reason Confirmation Modal */}
        <AnimatePresence>
          {cancellingOrder && (
            <div className="fixed inset-0 z-50 bg-[#0c0b0a]/90 backdrop-blur-md flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-[#14110f] border border-red-900/60 p-6 space-y-5 shadow-2xl"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-red-950/60 border border-red-700 flex items-center justify-center text-red-400 shrink-0">
                    <Ban className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-serif text-lg text-[#faf7f2]">
                      Cancel / Reject Order {cancellingOrder.id}
                    </h4>
                    <p className="text-[11px] text-[#e8e2d5]/60">
                      Total: {cancellingOrder.currency}{cancellingOrder.total.toFixed(2)} · {cancellingOrder.customerName}
                    </p>
                  </div>
                </div>

                <p className="text-xs text-[#e8e2d5]/80 leading-relaxed font-light">
                  Please specify the reason for cancelling or rejecting this order. The customer tracking status and audit log will be updated immediately.
                </p>

                <div className="space-y-2">
                  <label className="block text-[11px] uppercase tracking-wider text-[#c5a880]">
                    Select Cancellation Reason
                  </label>
                  {[
                    'Item out of stock',
                    'Customer requested cancellation',
                    'Kitchen at maximum capacity',
                    'Delivery address unreachable / out of area',
                    'Payment / Verification issue',
                    'Other (custom reason)',
                  ].map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 p-2 bg-[#0c0b0a] border border-[#2d241e] text-xs text-[#faf7f2] cursor-pointer hover:border-[#c5a880]/50"
                    >
                      <input
                        type="radio"
                        name="cancel_reason"
                        value={r}
                        checked={cancellationReason === r}
                        onChange={(e) => setCancellationReason(e.target.value)}
                        className="accent-[#c5a880]"
                      />
                      <span>{r}</span>
                    </label>
                  ))}

                  {cancellationReason === 'Other (custom reason)' && (
                    <div className="pt-2">
                      <input
                        type="text"
                        placeholder="Type specific reason..."
                        value={customReason}
                        onChange={(e) => setCustomReason(e.target.value)}
                        className="w-full px-3 py-2 bg-[#0c0b0a] border border-[#2d241e] text-xs text-[#faf7f2] focus:border-[#c5a880] focus:outline-none"
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2d241e]">
                  <button
                    type="button"
                    onClick={() => setCancellingOrder(null)}
                    className="px-4 py-2 border border-[#2d241e] text-xs uppercase tracking-wider text-[#e8e2d5]/70 hover:text-[#faf7f2] transition-colors cursor-pointer"
                  >
                    Keep Order
                  </button>
                  <button
                    type="button"
                    disabled={isUpdatingStatus}
                    onClick={() => {
                      const finalReason =
                        cancellationReason === 'Other (custom reason)' && customReason.trim()
                          ? customReason.trim()
                          : cancellationReason;
                      handleUpdateOrderStatus(
                        cancellingOrder.id,
                        'Cancelled',
                        `Order cancelled: ${finalReason}`
                      );
                    }}
                    className="px-4 py-2 bg-red-800 hover:bg-red-700 text-white text-xs uppercase tracking-wider font-medium transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isUpdatingStatus ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Staff Security & Verification Guide Modal */}
        <StaffSecurityGuideModal
          isOpen={isSecurityGuideOpen}
          onClose={() => setIsSecurityGuideOpen(false)}
        />
      </motion.div>
    </div>
  );
};
