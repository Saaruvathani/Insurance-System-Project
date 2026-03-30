import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { 
  loginAPI, 
  getPoliciesAPI, 
  applyPolicyAPI, 
  getMyClaimsAPI, 
  fetchPendingClaims, 
  updateClaimStatus,
  fetchUserProfileAPI, 
  payPremiumAPI 
} from './services/api';
import Register from './pages/Register';
import { Shield, LogOut, X, CreditCard, Heart, Car, Home, Umbrella, Star, TrendingUp, FileText, CheckCircle, Clock, XCircle, Users, DollarSign, AlertCircle, ChevronRight, Zap } from 'lucide-react';

// ==========================================
// PAYMENT MODAL COMPONENT
// ==========================================
const PaymentModal = ({ amount, onClose, onSuccess }) => {
  const [step, setStep] = useState('form');
  const [loadingText, setLoadingText] = useState('Processing payment...');
  const [card, setCard] = useState({ number: '', name: '', expiry: '', cvv: '' });
  const [errors, setErrors] = useState({});

  const updateCard = (field, value) => {
    let formatted = value;
    if (field === 'number') {
      formatted = value.replace(/\D/g, '').slice(0, 16);
      formatted = formatted.replace(/(.{4})/g, '$1 ').trim();
    }
    if (field === 'expiry') {
      formatted = value.replace(/\D/g, '').slice(0, 4);
      if (formatted.length >= 3) formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    }
    if (field === 'cvv') formatted = value.replace(/\D/g, '').slice(0, 4);
    setCard(prev => ({ ...prev, [field]: formatted }));
    setErrors(prev => ({ ...prev, [field]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (card.number.replace(/\s/g, '').length < 16) newErrors.number = 'Enter a valid 16-digit card number';
    if (card.name.trim().length < 3) newErrors.name = 'Enter the cardholder name';
    if (card.expiry.length < 5) newErrors.expiry = 'Enter a valid expiry date';
    if (card.cvv.length < 3) newErrors.cvv = 'Enter a valid CVV';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirm = async () => {
    if (!validate()) return;
    setStep('loading');
    const messages = ['Processing payment...', 'Verifying card details...', 'Updating your coverage...'];
    let i = 0;
    const iv = setInterval(() => { i++; if (i < messages.length) setLoadingText(messages[i]); }, 900);
    setTimeout(async () => {
      clearInterval(iv);
      try { await onSuccess(); } catch (e) {}
      setStep('success');
    }, 2800);
  };

  const getCardType = () => {
    const num = card.number.replace(/\s/g, '');
    if (num.startsWith('4')) return 'VISA';
    if (num.startsWith('5')) return 'MASTERCARD';
    if (num.startsWith('3')) return 'AMEX';
    return 'CARD';
  };

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'rgba(15, 15, 35, 0.7)',
      backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
      animation: 'fadeIn 0.2s ease'
    }}>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '2rem',
        width: '400px', maxWidth: '92vw', position: 'relative',
        boxShadow: '0 24px 64px rgba(0,0,0,0.2)',
        animation: 'slideUp 0.3s ease'
      }}>
        <style>{`
          @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
          @keyframes slideUp { from { transform: translateY(20px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
          @keyframes spin { to { transform: rotate(360deg) } }
        `}</style>

        {step !== 'loading' && (
          <button onClick={onClose} style={{
            position: 'absolute', top: '16px', right: '16px',
            background: '#f5f5f7', border: 'none', cursor: 'pointer',
            width: '32px', height: '32px', borderRadius: '50%',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <X size={15} color="#666" />
          </button>
        )}

        {step === 'form' && (
          <>
            <div style={{ marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>
                  <CreditCard size={18} color="white" />
                </div>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#0f0f23' }}>Secure Payment</h3>
              </div>
              <p style={{ margin: '8px 0 0', fontSize: '13px', color: '#888' }}>
                Paying <strong style={{ color: '#0f0f23' }}>${amount}</strong> · Coverage increases by <strong style={{ color: '#6366f1' }}>${amount * 3}</strong>
              </p>
            </div>

            {/* Visual card */}
            <div style={{
              background: 'linear-gradient(135deg, #1e1b4b 0%, #4338ca 50%, #7c3aed 100%)',
              borderRadius: '14px', padding: '1.2rem 1.4rem',
              color: 'white', marginBottom: '1.5rem',
              boxShadow: '0 8px 24px rgba(99, 102, 241, 0.35)',
              position: 'relative', overflow: 'hidden'
            }}>
              <div style={{
                position: 'absolute', top: '-20px', right: '-20px',
                width: '120px', height: '120px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)'
              }} />
              <p style={{ margin: '0 0 16px', fontSize: '10px', letterSpacing: '2px', opacity: 0.7, fontWeight: 600 }}>
                {getCardType()}
              </p>
              <p style={{ margin: '0 0 14px', fontSize: '15px', letterSpacing: '3px', fontFamily: 'monospace', fontWeight: 600 }}>
                {card.number || '•••• •••• •••• ••••'}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', opacity: 0.8 }}>
                <span style={{ letterSpacing: '1px' }}>{card.name.toUpperCase() || 'YOUR NAME'}</span>
                <span>{card.expiry || 'MM/YY'}</span>
              </div>
            </div>

            {[
              { field: 'number', label: 'Card Number', placeholder: '1234 5678 9012 3456' },
              { field: 'name', label: 'Cardholder Name', placeholder: 'John Smith' },
            ].map(({ field, label, placeholder }) => (
              <div key={field} style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</label>
                <input
                  style={{
                    width: '100%', padding: '11px 14px', marginTop: '6px',
                    border: `1.5px solid ${errors[field] ? '#ef4444' : '#e8e8f0'}`,
                    borderRadius: '10px', fontSize: '14px', outline: 'none',
                    boxSizing: 'border-box', transition: 'border-color 0.2s',
                    fontFamily: 'inherit'
                  }}
                  placeholder={placeholder}
                  value={card[field]}
                  onChange={e => updateCard(field, e.target.value)}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = errors[field] ? '#ef4444' : '#e8e8f0'}
                />
                {errors[field] && <p style={{ fontSize: '11px', color: '#ef4444', margin: '3px 0 0' }}>{errors[field]}</p>}
              </div>
            ))}

            <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem' }}>
              {[
                { field: 'expiry', label: 'Expiry', placeholder: 'MM/YY', type: 'text' },
                { field: 'cvv', label: 'CVV', placeholder: '•••', type: 'password' },
              ].map(({ field, label, placeholder, type }) => (
                <div key={field} style={{ flex: 1 }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: '#888', letterSpacing: '0.8px', textTransform: 'uppercase' }}>{label}</label>
                  <input
                    type={type}
                    style={{
                      width: '100%', padding: '11px 14px', marginTop: '6px',
                      border: `1.5px solid ${errors[field] ? '#ef4444' : '#e8e8f0'}`,
                      borderRadius: '10px', fontSize: '14px', outline: 'none',
                      boxSizing: 'border-box', transition: 'border-color 0.2s',
                      fontFamily: 'inherit'
                    }}
                    placeholder={placeholder}
                    value={card[field]}
                    onChange={e => updateCard(field, e.target.value)}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = errors[field] ? '#ef4444' : '#e8e8f0'}
                  />
                  {errors[field] && <p style={{ fontSize: '11px', color: '#ef4444', margin: '3px 0 0' }}>{errors[field]}</p>}
                </div>
              ))}
            </div>

            <button
              onClick={handleConfirm}
              style={{
                width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                border: 'none', borderRadius: '12px', color: 'white',
                fontSize: '15px', fontWeight: 700, cursor: 'pointer',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.4)',
                transition: 'transform 0.15s, box-shadow 0.15s',
                marginBottom: '10px'
              }}
              onMouseOver={e => { e.target.style.transform = 'translateY(-1px)'; e.target.style.boxShadow = '0 6px 20px rgba(99,102,241,0.5)'; }}
              onMouseOut={e => { e.target.style.transform = 'none'; e.target.style.boxShadow = '0 4px 16px rgba(99,102,241,0.4)'; }}
            >
              Pay ${amount} →
            </button>
            <button onClick={onClose} style={{
              width: '100%', padding: '11px', background: 'none',
              border: '1.5px solid #e8e8f0', borderRadius: '12px',
              cursor: 'pointer', fontSize: '14px', color: '#888', fontWeight: 500
            }}>Cancel</button>
            <p style={{ textAlign: 'center', fontSize: '11px', color: '#bbb', marginTop: '12px', marginBottom: 0 }}>
              🔒 256-bit encrypted · PCI DSS compliant
            </p>
          </>
        )}

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <div style={{
              width: '48px', height: '48px',
              border: '3px solid #f0f0f8', borderTop: '3px solid #6366f1',
              borderRadius: '50%', animation: 'spin 0.7s linear infinite',
              margin: '0 auto 1.5rem'
            }} />
            <p style={{ fontSize: '15px', color: '#333', margin: 0, fontWeight: 600 }}>{loadingText}</p>
            <p style={{ fontSize: '13px', color: '#aaa', marginTop: '6px' }}>Please don't close this window</p>
          </div>
        )}

        {step === 'success' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
              <div style={{
                width: '64px', height: '64px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #10b981, #059669)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 16px', boxShadow: '0 8px 24px rgba(16,185,129,0.3)'
              }}>
                <CheckCircle size={30} color="white" />
              </div>
              <h3 style={{ margin: '0 0 4px', fontSize: '20px', fontWeight: 700 }}>Payment Successful!</h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#888' }}>Your coverage has been updated instantly.</p>
            </div>
            <div style={{ background: '#f9f9fc', borderRadius: '12px', padding: '1rem', marginBottom: '1.2rem' }}>
              {[
                ['Amount Paid', `$${amount}`, '#0f0f23'],
                ['Coverage Added', `$${amount * 3}`, '#6366f1'],
                ['Card', `•••• ${card.number.replace(/\s/g, '').slice(-4)}`, '#0f0f23'],
              ].map(([label, value, color]) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '14px', marginBottom: '10px' }}>
                  <span style={{ color: '#888' }}>{label}</span>
                  <strong style={{ color }}>{value}</strong>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '14px', color: '#888' }}>Status</span>
                <span style={{
                  background: '#ecfdf5', color: '#059669', fontSize: '12px',
                  padding: '3px 12px', borderRadius: '20px', fontWeight: 600
                }}>✓ Confirmed</span>
              </div>
            </div>
            <button onClick={onClose} style={{
              width: '100%', padding: '13px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              border: 'none', borderRadius: '12px', color: 'white',
              fontSize: '15px', fontWeight: 700, cursor: 'pointer'
            }}>Done</button>
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// LOGIN
// ==========================================
const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const user = await loginAPI(email, password);
      localStorage.setItem('user', JSON.stringify(user));
      setUser(user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.toString());
    }
  };

  return (
    <div className="container login-box card">
      <Shield size={48} color="#4f46e5" style={{ marginBottom: '20px' }} />
      <h2>Insurance Portal</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input className="input" value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input className="input" type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn">Login Securely</button>
        {error && <p className="error-msg">{error}</p>}
      </form>
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <p>Don't have an account? <Link to="/register" style={{ color: '#4f46e5' }}>Register here</Link></p>
      </div>
    </div>
  );
};

// ==========================================
// PLAN ICONS HELPER
// ==========================================
const getPlanMeta = (name = '', index = 0) => {
  const n = name.toLowerCase();
  if (n.includes('health') || n.includes('medical')) return { icon: Heart, color: '#ef4444', bg: '#fff1f2', label: 'Most Popular' };
  if (n.includes('auto') || n.includes('car') || n.includes('vehicle')) return { icon: Car, color: '#f59e0b', bg: '#fffbeb', label: null };
  if (n.includes('home') || n.includes('property')) return { icon: Home, color: '#10b981', bg: '#f0fdf4', label: null };
  if (n.includes('life')) return { icon: Shield, color: '#6366f1', bg: '#eef2ff', label: 'Recommended' };
  const icons = [Umbrella, Heart, Car, Home, Shield, Zap];
  const colors = ['#6366f1', '#ef4444', '#f59e0b', '#10b981', '#8b5cf6', '#0ea5e9'];
  const bgs = ['#eef2ff', '#fff1f2', '#fffbeb', '#f0fdf4', '#f5f3ff', '#f0f9ff'];
  return { icon: icons[index % icons.length], color: colors[index % colors.length], bg: bgs[index % bgs.length], label: index === 1 ? 'Recommended' : null };
};

// ==========================================
// USER DASHBOARD
// ==========================================
const UserDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [myPolicies, setMyPolicies] = useState([]);
  const [userData, setUserData] = useState({ totalPaid: 0, availableCoverage: 0 });
  const [payAmount, setPayAmount] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState('plans');

  useEffect(() => {
    getPoliciesAPI().then(setPolicies);
    fetchUserStats();
    fetchClaims();
  }, []);

  const fetchUserStats = async () => {
    if (user?.id) {
      const data = await fetchUserProfileAPI(user.id);
      setUserData(data);
    }
  };

  const fetchClaims = async () => {
    if (user?.id) {
      const claims = await getMyClaimsAPI(user.id);
      setMyPolicies(claims);
    }
  };

  const handlePayClick = () => {
    if (!payAmount || Number(payAmount) <= 0) return alert('Enter a valid amount');
    setShowModal(true);
  };

  const handlePaymentSuccess = async () => {
    await payPremiumAPI(user.id, payAmount);
    fetchUserStats();
  };

  const handleModalClose = () => { setShowModal(false); setPayAmount(''); };

  const handleApply = async (policy) => {
    if (policy.cost > userData.availableCoverage) return alert('Insufficient Coverage!');
    if (confirm(`Claim $${policy.cost} for ${policy.name}?`)) {
      await applyPolicyAPI(user.id, user.username, policy);
      fetchClaims();
      fetchUserStats();
    }
  };

  const usagePercent = userData.availableCoverage > 0
    ? Math.min(100, Math.round((myPolicies.reduce((s, c) => s + (c.claimAmount || 0), 0) / userData.availableCoverage) * 100))
    : 0;

  const getInitials = (name = '') => name.slice(0, 2).toUpperCase() || 'U';

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5fb', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .plan-card { animation: fadeUp 0.4s ease both; }
        .plan-card:hover .apply-btn { transform: scale(1.03); box-shadow: 0 6px 20px rgba(0,0,0,0.15) !important; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.1) !important; }
        .claim-row:hover { background: #f9f9fc !important; }
        .tab-btn { transition: all 0.2s; }
        .tab-btn:hover { color: #6366f1 !important; }
      `}</style>

      {showModal && (
        <PaymentModal amount={Number(payAmount)} onClose={handleModalClose} onSuccess={handlePaymentSuccess} />
      )}

      {/* TOPBAR */}
      <div style={{
        background: 'white', borderBottom: '1px solid #e8e8f0',
        padding: '0 2rem', display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', height: '64px',
        boxShadow: '0 1px 8px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '17px', color: '#0f0f23', letterSpacing: '-0.3px' }}>InsureX</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 600, color: '#0f0f23' }}>{user?.username}</p>
            <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>Member</p>
          </div>
          <div style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 700, fontSize: '13px'
          }}>{getInitials(user?.username)}</div>
          <button onClick={() => { localStorage.removeItem('user'); navigate('/'); }} style={{
            background: '#f5f5f7', border: 'none', cursor: 'pointer',
            padding: '8px 14px', borderRadius: '8px',
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '13px', color: '#666', fontWeight: 500,
            transition: 'background 0.2s'
          }}>
            <LogOut size={14} /> Logout
          </button>
        </div>
      </div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '2rem' }}>

        {/* STAT CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '2rem' }}>

          {/* Total Paid */}
          <div className="stat-card" style={{
            background: 'white', borderRadius: '16px', padding: '1.4rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #e8e8f0',
            transition: 'all 0.2s', cursor: 'default'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#aaa', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Total Premium Paid</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#eef2ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <TrendingUp size={16} color="#6366f1" />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#0f0f23', letterSpacing: '-0.5px' }}>${userData.totalPaid}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#aaa' }}>Lifetime contributions</p>
          </div>

          {/* Coverage Limit */}
          <div className="stat-card" style={{
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)', borderRadius: '16px', padding: '1.4rem',
            boxShadow: '0 8px 24px rgba(99,102,241,0.3)',
            transition: 'all 0.2s', cursor: 'default', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{
              position: 'absolute', top: '-20px', right: '-20px',
              width: '100px', height: '100px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)'
            }} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.7)', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Available Coverage</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Shield size={16} color="white" />
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: 'white', letterSpacing: '-0.5px' }}>${userData.availableCoverage}</p>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>3× your premium</p>
          </div>

          {/* Pay Premium */}
          <div className="stat-card" style={{
            background: 'white', borderRadius: '16px', padding: '1.4rem',
            boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #e8e8f0',
            transition: 'all 0.2s'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#aaa', letterSpacing: '0.8px', textTransform: 'uppercase' }}>Pay Premium</span>
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <DollarSign size={16} color="#10b981" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="number"
                placeholder="Amount"
                value={payAmount}
                onChange={e => setPayAmount(e.target.value)}
                style={{
                  flex: 1, padding: '10px 12px',
                  border: '1.5px solid #e8e8f0', borderRadius: '10px',
                  fontSize: '14px', outline: 'none', fontFamily: 'inherit',
                  transition: 'border-color 0.2s'
                }}
                onFocus={e => e.target.style.borderColor = '#6366f1'}
                onBlur={e => e.target.style.borderColor = '#e8e8f0'}
              />
              <button
                onClick={handlePayClick}
                style={{
                  padding: '10px 16px', background: 'linear-gradient(135deg, #10b981, #059669)',
                  border: 'none', borderRadius: '10px', color: 'white',
                  fontWeight: 600, cursor: 'pointer', fontSize: '13px',
                  boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
                  transition: 'transform 0.15s'
                }}
                onMouseOver={e => e.target.style.transform = 'scale(1.03)'}
                onMouseOut={e => e.target.style.transform = 'none'}
              >Pay</button>
            </div>
            <p style={{ margin: '8px 0 0', fontSize: '11px', color: '#aaa' }}>Coverage = 3× your payment</p>
          </div>
        </div>

        {/* TABS */}
        <div style={{
          display: 'flex', gap: '4px', background: 'white',
          borderRadius: '12px', padding: '6px', marginBottom: '1.5rem',
          border: '1px solid #e8e8f0', width: 'fit-content',
          boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
        }}>
          {[
            { key: 'plans', label: 'Insurance Plans', icon: Shield },
            { key: 'claims', label: `My Claims ${myPolicies.length > 0 ? `(${myPolicies.length})` : ''}`, icon: FileText }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              className="tab-btn"
              onClick={() => setActiveTab(key)}
              style={{
                padding: '8px 18px', borderRadius: '8px', border: 'none',
                cursor: 'pointer', fontWeight: 600, fontSize: '14px',
                background: activeTab === key ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : 'transparent',
                color: activeTab === key ? 'white' : '#888',
                display: 'flex', alignItems: 'center', gap: '6px',
                boxShadow: activeTab === key ? '0 4px 12px rgba(99,102,241,0.3)' : 'none',
                fontFamily: 'inherit'
              }}
            >
              <Icon size={14} />{label}
            </button>
          ))}
        </div>

        {/* PLANS TAB */}
        {activeTab === 'plans' && (
          <>
            {policies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px solid #e8e8f0' }}>
                <Shield size={48} color="#e8e8f0" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#aaa', fontSize: '15px', margin: 0 }}>No insurance plans available right now.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
                {policies.map((p, i) => {
                  const meta = getPlanMeta(p.name, i);
                  const Icon = meta.icon;
                  const canApply = p.cost <= userData.availableCoverage;
                  return (
                    <div key={p.id} className="plan-card" style={{
                      background: 'white', borderRadius: '18px', padding: '1.5rem',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                      border: meta.label ? `2px solid ${meta.color}20` : '1px solid #e8e8f0',
                      position: 'relative', overflow: 'hidden',
                      animationDelay: `${i * 0.06}s`
                    }}>
                      {meta.label && (
                        <div style={{
                          position: 'absolute', top: '14px', right: '14px',
                          background: meta.color, color: 'white',
                          fontSize: '10px', fontWeight: 700, padding: '3px 10px',
                          borderRadius: '20px', letterSpacing: '0.5px'
                        }}>
                          {meta.label === 'Recommended' && <><Star size={9} style={{ marginRight: '3px', verticalAlign: 'middle' }} /></>}
                          {meta.label}
                        </div>
                      )}
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '14px',
                        background: meta.bg, display: 'flex', alignItems: 'center',
                        justifyContent: 'center', marginBottom: '14px'
                      }}>
                        <Icon size={22} color={meta.color} />
                      </div>
                      <h4 style={{ margin: '0 0 4px', fontSize: '16px', fontWeight: 700, color: '#0f0f23' }}>{p.name}</h4>
                      <p style={{ margin: '0 0 16px', fontSize: '12px', color: '#aaa' }}>{p.description || 'Comprehensive coverage plan'}</p>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', marginBottom: '16px' }}>
                        <span style={{ fontSize: '26px', fontWeight: 800, color: '#0f0f23', letterSpacing: '-0.5px' }}>${p.cost}</span>
                        <span style={{ fontSize: '13px', color: '#aaa' }}>/ claim</span>
                      </div>
                      {!canApply && (
                        <p style={{ fontSize: '11px', color: '#f59e0b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <AlertCircle size={11} /> Insufficient coverage balance
                        </p>
                      )}
                      <button
                        className="apply-btn"
                        onClick={() => handleApply(p)}
                        disabled={!canApply}
                        style={{
                          width: '100%', padding: '11px',
                          background: canApply ? `linear-gradient(135deg, ${meta.color}, ${meta.color}cc)` : '#f5f5f7',
                          border: 'none', borderRadius: '10px',
                          color: canApply ? 'white' : '#bbb',
                          fontWeight: 600, fontSize: '14px', cursor: canApply ? 'pointer' : 'not-allowed',
                          transition: 'all 0.2s',
                          boxShadow: canApply ? `0 4px 12px ${meta.color}40` : 'none',
                          fontFamily: 'inherit', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
                        }}
                      >
                        {canApply ? <><Zap size={14} /> Apply Now</> : 'Unavailable'}
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {/* CLAIMS TAB */}
        {activeTab === 'claims' && (
          <>
            {myPolicies.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px solid #e8e8f0' }}>
                <FileText size={48} color="#e8e8f0" style={{ marginBottom: '12px' }} />
                <p style={{ color: '#888', fontSize: '15px', fontWeight: 500, margin: '0 0 4px' }}>No claims submitted yet</p>
                <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>Apply for a plan above to get started.</p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e8e8f0', overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.05)' }}>
                <div style={{ padding: '1.2rem 1.5rem', borderBottom: '1px solid #f0f0f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#0f0f23' }}>Claim History</h3>
                  <span style={{ fontSize: '12px', color: '#aaa' }}>{myPolicies.length} claim{myPolicies.length !== 1 ? 's' : ''}</span>
                </div>
                {myPolicies.map((claim, i) => {
                  const statusConfig = {
                    'Approved': { color: '#10b981', bg: '#f0fdf4', icon: CheckCircle },
                    'Rejected': { color: '#ef4444', bg: '#fff1f2', icon: XCircle },
                    'Pending': { color: '#f59e0b', bg: '#fffbeb', icon: Clock }
                  }[claim.status] || { color: '#f59e0b', bg: '#fffbeb', icon: Clock };
                  const StatusIcon = statusConfig.icon;
                  return (
                    <div key={claim._id} className="claim-row" style={{
                      padding: '1rem 1.5rem',
                      borderBottom: i < myPolicies.length - 1 ? '1px solid #f5f5f8' : 'none',
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      transition: 'background 0.15s', cursor: 'default'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '40px', height: '40px', borderRadius: '12px',
                          background: statusConfig.bg, display: 'flex',
                          alignItems: 'center', justifyContent: 'center'
                        }}>
                          <StatusIcon size={18} color={statusConfig.color} />
                        </div>
                        <div>
                          <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#0f0f23' }}>{claim.policyName}</p>
                          <p style={{ margin: 0, fontSize: '11px', color: '#aaa' }}>{new Date(claim.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <p style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f0f23' }}>${claim.claimAmount}</p>
                        <span style={{
                          padding: '4px 12px', borderRadius: '20px',
                          background: statusConfig.bg, color: statusConfig.color,
                          fontSize: '12px', fontWeight: 600
                        }}>{claim.status}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ==========================================
// ADMIN DASHBOARD
// ==========================================
const AdminDashboard = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);
  const [filter, setFilter] = useState('all');
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => { loadClaims(); }, []);

  const loadClaims = async () => {
    const data = await fetchPendingClaims();
    setClaims(data);
  };

  const handleAction = async (id, status) => {
    console.log("🖱️ Button clicked:", id, status); // ← add this line
    setProcessingId(id);
    await updateClaimStatus(id, status);
    await loadClaims();
    setProcessingId(null);
};

  const stats = {
    total: claims.length,
    pending: claims.filter(c => c.status === 'Pending').length,
    approved: claims.filter(c => c.status === 'Approved').length,
    rejected: claims.filter(c => c.status === 'Rejected').length,
    totalValue: claims.reduce((s, c) => s + (c.claimAmount || 0), 0)
  };

  const filtered = filter === 'all' ? claims : claims.filter(c => c.status?.toLowerCase() === filter);

  return (
    <div style={{ minHeight: '100vh', background: '#f4f5fb', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
        @keyframes fadeUp { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
        .claim-row-admin:hover { background: #f9f9fc !important; }
        .action-btn:hover { transform: scale(1.05) !important; }
      `}</style>

      {/* TOPBAR */}
      <div style={{
        background: '#0f0f23', padding: '0 2rem',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '64px', position: 'sticky', top: 0, zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Shield size={16} color="white" />
          </div>
          <span style={{ fontWeight: 700, fontSize: '17px', color: 'white', letterSpacing: '-0.3px' }}>InsureX</span>
          <span style={{
            background: 'rgba(99,102,241,0.2)', color: '#a5b4fc',
            fontSize: '10px', fontWeight: 700, padding: '3px 10px',
            borderRadius: '20px', letterSpacing: '1px', textTransform: 'uppercase'
          }}>Admin</span>
        </div>
        <button onClick={() => navigate('/')} style={{
          background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
          cursor: 'pointer', padding: '8px 16px', borderRadius: '8px',
          display: 'flex', alignItems: 'center', gap: '6px',
          fontSize: '13px', color: 'rgba(255,255,255,0.7)', fontWeight: 500,
          transition: 'all 0.2s', fontFamily: 'inherit'
        }}>
          <LogOut size={14} /> Logout
        </button>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>

        {/* Header */}
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ margin: '0 0 4px', fontSize: '26px', fontWeight: 800, color: '#0f0f23', letterSpacing: '-0.5px' }}>Claims Management</h1>
          <p style={{ margin: 0, fontSize: '14px', color: '#aaa' }}>Review and process insurance claims</p>
        </div>

        {/* STATS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px', marginBottom: '2rem' }}>
          {[
            { label: 'Total Claims', value: stats.total, icon: FileText, color: '#6366f1', bg: '#eef2ff' },
            { label: 'Pending Review', value: stats.pending, icon: Clock, color: '#f59e0b', bg: '#fffbeb' },
            { label: 'Approved', value: stats.approved, icon: CheckCircle, color: '#10b981', bg: '#f0fdf4' },
            { label: 'Total Value', value: `$${stats.totalValue.toLocaleString()}`, icon: DollarSign, color: '#8b5cf6', bg: '#f5f3ff' },
          ].map(({ label, value, icon: Icon, color, bg }, i) => (
            <div key={label} style={{
              background: 'white', borderRadius: '14px', padding: '1.2rem',
              boxShadow: '0 4px 16px rgba(0,0,0,0.05)', border: '1px solid #e8e8f0',
              animation: `fadeUp 0.4s ease ${i * 0.08}s both`
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <span style={{ fontSize: '11px', fontWeight: 600, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{label}</span>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon size={15} color={color} />
                </div>
              </div>
              <p style={{ margin: 0, fontSize: '24px', fontWeight: 800, color: '#0f0f23', letterSpacing: '-0.5px' }}>{value}</p>
            </div>
          ))}
        </div>

        {/* FILTER TABS */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
          {[
            { key: 'all', label: 'All Claims' },
            { key: 'pending', label: 'Pending' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} style={{
              padding: '7px 16px', borderRadius: '8px', border: 'none', cursor: 'pointer',
              fontWeight: 600, fontSize: '13px', fontFamily: 'inherit',
              background: filter === key ? '#0f0f23' : 'white',
              color: filter === key ? 'white' : '#666',
              border: filter === key ? 'none' : '1px solid #e8e8f0',
              transition: 'all 0.2s'
            }}>{label}</button>
          ))}
        </div>

        {/* CLAIMS TABLE */}
        <div style={{
          background: 'white', borderRadius: '16px',
          border: '1px solid #e8e8f0', overflow: 'hidden',
          boxShadow: '0 4px 16px rgba(0,0,0,0.05)'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px 180px',
            padding: '1rem 1.5rem', background: '#f9f9fc',
            borderBottom: '1px solid #e8e8f0'
          }}>
            {['User', 'Policy', 'Amount', 'Status', 'Actions'].map(h => (
              <span key={h} style={{ fontSize: '11px', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.8px' }}>{h}</span>
            ))}
          </div>

          {/* Rows */}
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <CheckCircle size={48} color="#e8e8f0" style={{ marginBottom: '12px' }} />
              <p style={{ color: '#888', fontSize: '15px', fontWeight: 500, margin: '0 0 4px' }}>No claims here</p>
              <p style={{ color: '#aaa', fontSize: '13px', margin: 0 }}>All caught up!</p>
            </div>
          ) : (
            filtered.map((c, i) => {
              const statusConfig = {
                'Approved': { color: '#10b981', bg: '#f0fdf4' },
                'Rejected': { color: '#ef4444', bg: '#fff1f2' },
                'Pending': { color: '#f59e0b', bg: '#fffbeb' }
              }[c.status] || { color: '#f59e0b', bg: '#fffbeb' };
              const isProcessing = processingId === c._id;

              return (
                <div key={c._id} className="claim-row-admin" style={{
                  display: 'grid', gridTemplateColumns: '1fr 1fr 100px 120px 180px',
                  padding: '1rem 1.5rem', alignItems: 'center',
                  borderBottom: i < filtered.length - 1 ? '1px solid #f5f5f8' : 'none',
                  transition: 'background 0.15s',
                  animation: `fadeUp 0.35s ease ${i * 0.04}s both`
                }}>
                  {/* User */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{
                      width: '34px', height: '34px', borderRadius: '50%',
                      background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '12px', fontWeight: 700, flexShrink: 0
                    }}>
                      {(c.userName || 'U').slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#0f0f23' }}>{c.userName}</span>
                  </div>

                  {/* Policy */}
                  <span style={{ fontSize: '13px', color: '#555' }}>{c.policyName}</span>

                  {/* Amount */}
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#0f0f23' }}>${c.claimAmount}</span>

                  {/* Status */}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px',
                    padding: '4px 12px', borderRadius: '20px',
                    background: statusConfig.bg, color: statusConfig.color,
                    fontSize: '12px', fontWeight: 600, width: 'fit-content'
                  }}>
                    {c.status || 'Pending'}
                  </span>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {c.status === 'Pending' || !c.status ? (
                      <>
                        <button
                          className="action-btn"
                          onClick={() => handleAction(c._id, 'Approved')}
                          disabled={isProcessing}
                          style={{
                            padding: '7px 14px', background: 'linear-gradient(135deg, #10b981, #059669)',
                            border: 'none', borderRadius: '8px', color: 'white',
                            fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                            transition: 'transform 0.15s',
                            boxShadow: '0 3px 10px rgba(16,185,129,0.3)',
                            opacity: isProcessing ? 0.6 : 1, fontFamily: 'inherit'
                          }}
                        >✓ Approve</button>
                        <button
                          className="action-btn"
                          onClick={() => handleAction(c._id, 'Rejected')}
                          disabled={isProcessing}
                          style={{
                            padding: '7px 14px', background: '#fff1f2',
                            border: '1px solid #fecaca', borderRadius: '8px', color: '#ef4444',
                            fontWeight: 600, fontSize: '12px', cursor: 'pointer',
                            transition: 'transform 0.15s',
                            opacity: isProcessing ? 0.6 : 1, fontFamily: 'inherit'
                          }}
                        >✗ Reject</button>
                      </>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#aaa', fontStyle: 'italic' }}>Processed</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {filtered.length > 0 && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: '#ccc', marginTop: '12px' }}>
            Showing {filtered.length} of {claims.length} claims
          </p>
        )}
      </div>
    </div>
  );
};

// ==========================================
// APP
// ==========================================
function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={user ? <UserDashboard user={user} /> : <Login setUser={setUser} />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Login setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;