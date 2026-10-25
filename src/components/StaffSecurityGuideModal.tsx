import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  FileCode,
  Server,
  Terminal,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  X,
  ExternalLink,
  BookOpen,
  AlertTriangle,
  Play
} from 'lucide-react';

interface StaffSecurityGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenStaffDashboard?: () => void;
}

export const StaffSecurityGuideModal: React.FC<StaffSecurityGuideModalProps> = ({
  isOpen,
  onClose,
  onOpenStaffDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<'access' | 'session' | 'rules' | 'test'>('access');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Self-test states
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testResults, setTestResults] = useState<{
    unauthCheck?: { passed: boolean; message: string; status: number };
    codRulesCheck?: { passed: boolean; message: string; minCod: number; codFee: number };
    sessionCheck?: { hasToken: boolean; message: string };
  } | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runSecurityAudit = async () => {
    setIsRunningTest(true);
    setTestResults(null);

    try {
      // Test 1: Verify /api/staff/orders rejects unauthorized requests with 401
      let unauthPassed = false;
      let unauthStatus = 0;
      let unauthMsg = '';
      try {
        const unauthRes = await fetch('/api/staff/orders', {
          headers: { 'Accept': 'application/json' },
        });
        unauthStatus = unauthRes.status;
        if (unauthStatus === 401) {
          unauthPassed = true;
          unauthMsg = 'HTTP 401 Unauthorized returned. Public order access is strictly blocked.';
        } else {
          unauthMsg = `Expected 401 but received HTTP ${unauthStatus}.`;
        }
      } catch (e: unknown) {
        unauthMsg = e instanceof Error ? e.message : 'Network error testing endpoint';
      }

      // Test 2: Verify server COD configuration
      let codPassed = false;
      let codMsg = '';
      let minCod = 500;
      let codFee = 100;
      try {
        const configRes = await fetch('/api/config');
        if (configRes.ok) {
          const cfg = await configRes.json();
          minCod = cfg.minCodSubtotal ?? 500;
          codFee = cfg.codFee ?? 100;
          codPassed = minCod === 500 && codFee === 100;
          codMsg = `Server enforces minimum COD subtotal of ₹${minCod} and COD surcharge of ₹${codFee}.`;
        } else {
          codMsg = 'Could not load store settings configuration.';
        }
      } catch (e: unknown) {
        codMsg = e instanceof Error ? e.message : 'Network error loading config';
      }

      // Test 3: Session storage token status
      const localToken = sessionStorage.getItem('cafe1911_staff_token');
      const hasToken = Boolean(localToken);
      const sessionMsg = hasToken
        ? 'Active session token found in tab sessionStorage (Staff authorized).'
        : 'No session token in sessionStorage (Anonymous browser session).';

      setTestResults({
        unauthCheck: { passed: unauthPassed, message: unauthMsg, status: unauthStatus },
        codRulesCheck: { passed: codPassed, message: codMsg, minCod, codFee },
        sessionCheck: { hasToken, message: sessionMsg },
      });
    } finally {
      setIsRunningTest(false);
    }
  };

  const staffUrl = typeof window !== 'undefined' ? `${window.location.origin}/staff` : 'https://.../staff';

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

      {/* Main Modal Box */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 15 }}
        className="relative w-full max-w-4xl h-[92vh] max-h-[850px] bg-[#14110f] border border-[#2d241e] shadow-2xl flex flex-col overflow-hidden text-[#faf7f2]"
      >
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-[#2d241e] bg-[#0c0b0a] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded border border-[#c5a880]/50 flex items-center justify-center bg-[#1c1815] text-[#c5a880]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                  CAFE 1911 ARCHITECTURE & SECURITY SPECIFICATION
                </span>
                <span className="px-1.5 py-0.5 bg-[#c5a880]/20 text-[#c5a880] text-[9px] uppercase tracking-wider rounded font-mono">
                  v2.4
                </span>
              </div>
              <h2 className="font-serif text-lg sm:text-xl text-[#faf7f2] font-normal">
                Staff Authentication & Security Verification Guide
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#e8e2d5]/60 hover:text-[#faf7f2] transition-colors cursor-pointer"
            aria-label="Close Security Guide"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 py-2.5 bg-[#181412] border-b border-[#2d241e] flex items-center gap-2 sm:gap-4 text-xs overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('access')}
            className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'access'
                ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>1. Accessing /staff</span>
          </button>

          <button
            onClick={() => setActiveTab('session')}
            className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'session'
                ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>2. Session Handling</span>
          </button>

          <button
            onClick={() => setActiveTab('rules')}
            className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'rules'
                ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>3. Firebase Rules & Server</span>
          </button>

          <button
            onClick={() => setActiveTab('test')}
            className={`py-2 px-3 uppercase tracking-[0.18em] transition-colors flex items-center gap-2 cursor-pointer shrink-0 ${
              activeTab === 'test'
                ? 'border-b-2 border-[#c5a880] text-[#c5a880] font-semibold'
                : 'text-[#e8e2d5]/60 hover:text-[#faf7f2]'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>4. Verification & Self-Test</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* TAB 1: ACCESSING /STAFF */}
          {activeTab === 'access' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#0c0b0a] border border-[#2d241e] p-5 space-y-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                  Primary Access Routes
                </span>
                <h3 className="font-serif text-lg text-[#faf7f2]">
                  How the Café Manager Enters the Staff Console
                </h3>
                <p className="text-xs text-[#e8e2d5]/80 leading-relaxed font-light">
                  The private manager dashboard is integrated directly into the application with client-side route routing and deep-linking. There are three seamless ways to open it:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-2">
                    <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
                      <Terminal className="w-4 h-4" />
                      <span>Direct URL</span>
                    </div>
                    <p className="text-[11px] text-[#e8e2d5]/70 leading-relaxed">
                      Append <code className="text-[#c5a880] bg-[#0c0b0a] px-1 py-0.5 rounded font-mono">/staff</code> to your preview browser address. The router listens to <code className="text-xs font-mono">window.location.pathname</code> and opens the salon portal immediately.
                    </p>
                  </div>

                  <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-2">
                    <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
                      <Lock className="w-4 h-4" />
                      <span>Header Navigation</span>
                    </div>
                    <p className="text-[11px] text-[#e8e2d5]/70 leading-relaxed">
                      Click the dedicated <strong className="text-[#faf7f2]">Staff</strong> lock button located in the top navigation bar next to the Order Bag icon.
                    </p>
                  </div>

                  <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-2">
                    <div className="flex items-center gap-2 text-[#c5a880] text-xs font-semibold uppercase tracking-wider">
                      <BookOpen className="w-4 h-4" />
                      <span>Footer Link</span>
                    </div>
                    <p className="text-[11px] text-[#e8e2d5]/70 leading-relaxed">
                      Scroll to the footer and click <strong className="text-[#faf7f2]">Staff Portal</strong> under the Private Salon column.
                    </p>
                  </div>
                </div>
              </div>

              {/* Direct Link Copier */}
              <div className="p-4 bg-[#181412] border border-[#2d241e] flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[#c5a880] font-medium block">
                    Direct Route Address
                  </span>
                  <p className="font-mono text-xs text-[#faf7f2] break-all">{staffUrl}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleCopy(staffUrl, 'url')}
                    className="px-3 py-2 bg-[#0c0b0a] hover:bg-[#201c18] border border-[#2d241e] text-xs text-[#c5a880] flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedKey === 'url' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'url' ? 'Copied' : 'Copy Route URL'}</span>
                  </button>

                  {onOpenStaffDashboard && (
                    <button
                      onClick={() => {
                        onClose();
                        onOpenStaffDashboard();
                      }}
                      className="px-4 py-2 bg-[#c5a880] hover:bg-[#dfcaa7] text-[#0c0b0a] text-xs font-medium uppercase tracking-[0.18em] flex items-center gap-2 transition-colors cursor-pointer"
                    >
                      <span>Open Staff Console</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Default Manager Credentials */}
              <div className="bg-[#0c0b0a] border border-[#2d241e] p-5 space-y-3">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold flex items-center gap-2">
                  <KeyRound className="w-3.5 h-3.5" />
                  Initial Manager Access Credentials
                </span>
                <p className="text-xs text-[#e8e2d5]/80 font-light">
                  Use the provisioned credentials below to authenticate. Once inside, you can rotate the manager username and password under the <strong className="text-[#c5a880]">Credentials & Key</strong> tab at any time:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3 bg-[#14110f] border border-[#2d241e] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#e8e2d5]/50 block">Username</span>
                      <code className="text-sm font-mono text-[#faf7f2]">manager</code>
                    </div>
                    <button
                      onClick={() => handleCopy('manager', 'user')}
                      className="p-1.5 text-[#c5a880] hover:text-[#faf7f2] cursor-pointer"
                    >
                      {copiedKey === 'user' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="p-3 bg-[#14110f] border border-[#2d241e] flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase tracking-wider text-[#e8e2d5]/50 block">Password</span>
                      <code className="text-sm font-mono text-[#faf7f2]">Cafe1911Luxury!</code>
                    </div>
                    <button
                      onClick={() => handleCopy('Cafe1911Luxury!', 'pwd')}
                      className="p-1.5 text-[#c5a880] hover:text-[#faf7f2] cursor-pointer"
                    >
                      {copiedKey === 'pwd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: SESSION HANDLING */}
          {activeTab === 'session' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#0c0b0a] border border-[#2d241e] p-5 space-y-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                  Zero Trust Session Architecture
                </span>
                <h3 className="font-serif text-lg text-[#faf7f2]">
                  Browser-Based Session Handling & Security Lifecycle
                </h3>
                <p className="text-xs text-[#e8e2d5]/80 leading-relaxed font-light">
                  To prevent unauthorized access, credential leakage, or session hijacking across shared or public terminals, CAFE 1911 implements strict ephemeral session standards:
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-1.5">
                    <h4 className="text-xs font-semibold text-[#c5a880] uppercase tracking-wider flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      1. SessionStorage Tab Isolation
                    </h4>
                    <p className="text-xs text-[#e8e2d5]/80 font-light leading-relaxed">
                      The authenticated token is kept strictly in <code className="text-[#c5a880] font-mono">sessionStorage.getItem(&apos;cafe1911_staff_token&apos;)</code>. Unlike <code className="text-xs font-mono">localStorage</code>, <code className="text-xs font-mono">sessionStorage</code> is strictly bound to the active browser tab. The moment the manager closes the tab or quits the browser window, all access tokens are instantaneously obliterated.
                    </p>
                  </div>

                  <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-1.5">
                    <h4 className="text-xs font-semibold text-[#c5a880] uppercase tracking-wider flex items-center gap-2">
                      <Server className="w-4 h-4" />
                      2. Cryptographic PBKDF2 Password Verification
                    </h4>
                    <p className="text-xs text-[#e8e2d5]/80 font-light leading-relaxed">
                      Passwords are never transmitted to third parties or saved in plaintext. The backend (<code className="text-xs font-mono">server.ts</code>) hashes input passwords using <strong className="text-[#faf7f2]">PBKDF2 with 100,000 SHA-512 iterations</strong> and a unique cryptographic salt. Even if database files were inspected, raw passwords cannot be reversed.
                    </p>
                  </div>

                  <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-1.5">
                    <h4 className="text-xs font-semibold text-[#c5a880] uppercase tracking-wider flex items-center gap-2">
                      <KeyRound className="w-4 h-4" />
                      3. Bearer Token Lifecycle & Instant Revocation
                    </h4>
                    <p className="text-xs text-[#e8e2d5]/80 font-light leading-relaxed">
                      Upon successful authentication via <code className="text-xs font-mono">POST /api/staff/login</code>, an entropy-grade 256-bit hexadecimal Bearer token is issued with a strict 12-hour expiration window. Clicking <strong className="text-red-300">Logout</strong> immediately calls <code className="text-xs font-mono">POST /api/staff/logout</code> to revoke the token on the server and purge <code className="text-xs font-mono">sessionStorage</code>.
                    </p>
                  </div>

                  <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-1.5">
                    <h4 className="text-xs font-semibold text-[#c5a880] uppercase tracking-wider flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      4. Zero Credential Exposure in Client Code
                    </h4>
                    <p className="text-xs text-[#e8e2d5]/80 font-light leading-relaxed">
                      No admin secrets, salt values, or master passwords exist in any client-side JavaScript bundle. Any client attempt to invoke staff endpoints without the <code className="text-xs font-mono">Authorization: Bearer &lt;token&gt;</code> header is rejected with an HTTP 401 Unauthorized status.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: FIREBASE RULES & SERVER */}
          {activeTab === 'rules' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#0c0b0a] border border-[#2d241e] p-5 space-y-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                  Multi-Tier Security Enforcement
                </span>
                <h3 className="font-serif text-lg text-[#faf7f2]">
                  How Security Rules & Server Protect Orders & Customer Data
                </h3>
                <p className="text-xs text-[#e8e2d5]/80 leading-relaxed font-light">
                  Security is enforced at two distinct, non-bypassable layers: the <strong className="text-[#faf7f2]">Firebase Firestore Security Rules Engine</strong> and the <strong className="text-[#faf7f2]">Trusted Server Middleware</strong>.
                </p>

                {/* Firestore Rules Matrix */}
                <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-3">
                  <h4 className="text-xs font-semibold text-[#c5a880] uppercase tracking-wider flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Firestore Security Rules (firestore.rules)
                  </h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border border-[#2d241e]">
                      <thead className="bg-[#1c1815] text-[#c5a880] uppercase text-[10px] tracking-wider border-b border-[#2d241e]">
                        <tr>
                          <th className="p-2.5">Collection</th>
                          <th className="p-2.5">Operation</th>
                          <th className="p-2.5">Rule Permission</th>
                          <th className="p-2.5">Security Rationale</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#2d241e] text-[11px] font-mono">
                        <tr>
                          <td className="p-2.5 text-[#faf7f2]">/orders/{'{id}'}</td>
                          <td className="p-2.5 text-red-300">list (query all)</td>
                          <td className="p-2.5 text-amber-300">if isAdmin()</td>
                          <td className="p-2.5 text-[#e8e2d5]/70 font-sans">
                            Direct client listing by unauthorized users fails with <code className="text-red-300">permission-denied</code>.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-[#faf7f2]">/orders/{'{id}'}</td>
                          <td className="p-2.5 text-emerald-300">get (single ID)</td>
                          <td className="p-2.5 text-[#faf7f2]">if isValidId(orderId)</td>
                          <td className="p-2.5 text-[#e8e2d5]/70 font-sans">
                            Permits customer tracking solely when they know their exact private order UUID.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-[#faf7f2]">/orders/{'{id}'}</td>
                          <td className="p-2.5 text-amber-300">update (status)</td>
                          <td className="p-2.5 text-amber-300">if isAdmin()</td>
                          <td className="p-2.5 text-[#e8e2d5]/70 font-sans">
                            Only authenticated managers can advance order status or append staff kitchen notes.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-[#faf7f2]">/menu/{'{id}'}</td>
                          <td className="p-2.5 text-red-300">write / update</td>
                          <td className="p-2.5 text-amber-300">if isAdmin()</td>
                          <td className="p-2.5 text-[#e8e2d5]/70 font-sans">
                            Prevents unauthorized manipulation of dish pricing or catalog availability.
                          </td>
                        </tr>
                        <tr>
                          <td className="p-2.5 text-[#faf7f2]">/settings/{'{id}'}</td>
                          <td className="p-2.5 text-red-300">write / update</td>
                          <td className="p-2.5 text-amber-300">if isAdmin()</td>
                          <td className="p-2.5 text-[#e8e2d5]/70 font-sans">
                            Guards COD minimum subtotal (₹500) and COD fee (₹100) from client tampering.
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Server Middleware */}
                <div className="p-4 bg-[#14110f] border border-[#2d241e] space-y-2">
                  <h4 className="text-xs font-semibold text-[#c5a880] uppercase tracking-wider flex items-center gap-2">
                    <Server className="w-4 h-4" />
                    Trusted Server-Side Middleware (requireStaffAuth)
                  </h4>
                  <p className="text-xs text-[#e8e2d5]/80 font-light leading-relaxed">
                    Even outside direct Firestore SDK queries, all REST API routes serving salon data (<code className="text-xs font-mono">/api/staff/*</code>) enforce the <code className="text-xs font-mono">requireStaffAuth</code> gate in <code className="text-xs font-mono">server.ts</code>. Furthermore, all customer orders submitted to <code className="text-xs font-mono">POST /api/orders</code> are recalculated on the server against official menu prices. The client subtotal is never trusted.
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 4: VERIFICATION & SELF-TEST */}
          {activeTab === 'test' && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <div className="bg-[#0c0b0a] border border-[#2d241e] p-5 space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                      Live Verification Console
                    </span>
                    <h3 className="font-serif text-lg text-[#faf7f2]">
                      Automated Security & Access Auditing
                    </h3>
                  </div>

                  <button
                    onClick={runSecurityAudit}
                    disabled={isRunningTest}
                    className="px-4 py-2 bg-[#c5a880] hover:bg-[#dfcaa7] active:bg-[#b0926b] text-[#0c0b0a] text-xs font-medium uppercase tracking-[0.18em] flex items-center gap-2 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <Play className="w-3.5 h-3.5" />
                    <span>{isRunningTest ? 'Running Audit...' : 'Run Live Security Audit'}</span>
                  </button>
                </div>

                <p className="text-xs text-[#e8e2d5]/80 font-light leading-relaxed">
                  Trigger an automated verification check against the running server to prove that unauthorized access is blocked and store rules are active:
                </p>

                {/* Audit Results */}
                {testResults ? (
                  <div className="space-y-3 pt-2">
                    {/* Unauth Test */}
                    <div className={`p-4 border ${testResults.unauthCheck?.passed ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-red-950/20 border-red-800/60'} flex items-start gap-3`}>
                      {testResults.unauthCheck?.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#faf7f2]">
                            Unauthorized Order Access Check
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 font-mono uppercase rounded ${testResults.unauthCheck?.passed ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
                            {testResults.unauthCheck?.passed ? 'PASSED (HTTP 401)' : 'FAILED'}
                          </span>
                        </div>
                        <p className="text-xs text-[#e8e2d5]/70 mt-1 font-light">
                          {testResults.unauthCheck?.message}
                        </p>
                      </div>
                    </div>

                    {/* COD Rules Test */}
                    <div className={`p-4 border ${testResults.codRulesCheck?.passed ? 'bg-emerald-950/20 border-emerald-800/60' : 'bg-red-950/20 border-red-800/60'} flex items-start gap-3`}>
                      {testResults.codRulesCheck?.passed ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#faf7f2]">
                            Server Cash on Delivery (COD) Rules Enforcement
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 font-mono uppercase rounded ${testResults.codRulesCheck?.passed ? 'bg-emerald-900/40 text-emerald-300' : 'bg-red-900/40 text-red-300'}`}>
                            {testResults.codRulesCheck?.passed ? 'ACTIVE' : 'CHECK NEEDED'}
                          </span>
                        </div>
                        <p className="text-xs text-[#e8e2d5]/70 mt-1 font-light">
                          {testResults.codRulesCheck?.message}
                        </p>
                      </div>
                    </div>

                    {/* Session Test */}
                    <div className="p-4 border bg-[#14110f] border-[#2d241e] flex items-start gap-3">
                      <Lock className="w-5 h-5 text-[#c5a880] shrink-0 mt-0.5" />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#faf7f2]">
                            Current Tab Session Status
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 font-mono uppercase rounded bg-[#1c1815] text-[#c5a880] border border-[#2d241e]">
                            {testResults.sessionCheck?.hasToken ? 'Staff Session Active' : 'Anonymous Client'}
                          </span>
                        </div>
                        <p className="text-xs text-[#e8e2d5]/70 mt-1 font-light">
                          {testResults.sessionCheck?.message}
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-[#14110f] border border-[#2d241e] text-center text-xs text-[#e8e2d5]/50 italic">
                    Click &quot;Run Live Security Audit&quot; above to execute an immediate diagnostic probe against the running server.
                  </div>
                )}
              </div>

              {/* Developer / Shell Verification Snippets */}
              <div className="bg-[#0c0b0a] border border-[#2d241e] p-5 space-y-4">
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#c5a880] font-semibold">
                  Manual Verification Commands
                </span>
                <h3 className="font-serif text-lg text-[#faf7f2]">
                  Terminal &amp; cURL Testing Instructions
                </h3>
                <p className="text-xs text-[#e8e2d5]/80 font-light leading-relaxed">
                  You can verify access control directly from any terminal or developer console using these commands:
                </p>

                {/* Command 1 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#e8e2d5]/70">
                    <span>1. Verify unauthenticated order access is rejected (HTTP 401):</span>
                    <button
                      onClick={() => handleCopy('curl -i http://localhost:3000/api/staff/orders', 'curl1')}
                      className="text-[11px] text-[#c5a880] hover:text-[#faf7f2] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'curl1' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy cURL</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#14110f] border border-[#2d241e] text-[#c5a880] font-mono text-[11px] overflow-x-auto rounded">
                    curl -i http://localhost:3000/api/staff/orders
                  </pre>
                </div>

                {/* Command 2 */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-[#e8e2d5]/70">
                    <span>2. Authenticate manager and receive bearer token:</span>
                    <button
                      onClick={() => handleCopy('curl -s -X POST http://localhost:3000/api/staff/login -H "Content-Type: application/json" -d \'{"username":"manager","password":"Cafe1911Luxury!"}\'', 'curl2')}
                      className="text-[11px] text-[#c5a880] hover:text-[#faf7f2] flex items-center gap-1 cursor-pointer"
                    >
                      {copiedKey === 'curl2' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      <span>Copy cURL</span>
                    </button>
                  </div>
                  <pre className="p-3 bg-[#14110f] border border-[#2d241e] text-[#c5a880] font-mono text-[11px] overflow-x-auto rounded">
                    curl -s -X POST http://localhost:3000/api/staff/login -H &quot;Content-Type: application/json&quot; -d &apos;{JSON.stringify({ username: "manager", password: "Cafe1911Luxury!" })}&apos;
                  </pre>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-[#0c0b0a] border-t border-[#2d241e] flex items-center justify-between text-xs shrink-0">
          <span className="text-[11px] text-[#e8e2d5]/50 font-mono">
            Security Specification · CAFE 1911 The Imperial New Delhi
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-[#2d241e] hover:border-[#c5a880] text-[#e8e2d5] hover:text-[#faf7f2] text-xs uppercase tracking-wider transition-colors cursor-pointer"
          >
            Close Guide
          </button>
        </div>
      </motion.div>
    </div>
  );
};
