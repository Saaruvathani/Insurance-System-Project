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
import { Shield, LogOut } from 'lucide-react';

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
      setUser(user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.toString());
    }
  };

  return (
    <div className="container login-box card">
      <Shield size={48} color="#4f46e5" style={{marginBottom:'20px'}} />
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

const UserDashboard = ({ user }) => {
  const navigate = useNavigate();
  const [policies, setPolicies] = useState([]);
  const [myPolicies, setMyPolicies] = useState([]);
  const [userData, setUserData] = useState({ totalPaid: 0, availableCoverage: 0 });
  const [payAmount, setPayAmount] = useState("");

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

  const handlePayment = async () => {
    try {
      await payPremiumAPI(user.id, payAmount); 
      alert("Payment Successful!");
      setPayAmount("");
      fetchUserStats(); 
    } catch (err) {
      alert("Payment failed");
    }
  };

  const handleApply = async (policy) => {
    if (policy.cost > userData.availableCoverage) {
      return alert("Insufficient Coverage!");
    }
    if (confirm(`Claim $${policy.cost} for ${policy.name}?`)) {
      await applyPolicyAPI(user.id, user.username, policy);
      fetchClaims();
      fetchUserStats(); 
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <h3>Welcome, {user?.username}</h3>
        <button className="btn btn-outline" onClick={() => navigate('/')}> <LogOut size={16}/> Logout</button>
      </div>

      <div className="card-grid" style={{ marginBottom: '30px' }}>
        <div className="card">
          <p>Total Paid: <strong>${userData.totalPaid}</strong></p>
        </div>
        <div className="card">
          <p>Limit (3x): <strong>${userData.availableCoverage}</strong></p>
        </div>
        <div className="card">
          <input type="number" placeholder="Amt" value={payAmount} onChange={e => setPayAmount(e.target.value)} />
          <button onClick={handlePayment}>Pay</button>
        </div>
      </div>

      <h3>Plans</h3>
      <div className="card-grid">
        {policies.map(p => (
          <div key={p.id} className="card">
            <h4>{p.name}</h4>
            <p>${p.cost}</p>
            <button onClick={() => handleApply(p)} disabled={p.cost > userData.availableCoverage}>Apply</button>
          </div>
        ))}
      </div>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [claims, setClaims] = useState([]);

  useEffect(() => { loadClaims(); }, []);

  const loadClaims = async () => {
    const data = await fetchPendingClaims();
    setClaims(data);
  };

  const handleAction = async (id, status) => {
    await updateClaimStatus(id, status);
    alert(`Claim ${status}`);
    loadClaims();
  };

  return (
    <div className="container">
      <div className="navbar">
        <h3>Admin Panel</h3>
        <button className="btn btn-outline" onClick={() => navigate('/')}>Logout</button>
      </div>
      <div className="card">
        <h3>Pending Claims</h3>
        {claims.length === 0 ? <p>No claims.</p> : (
          <table width="100%">
            <thead><tr><th>User</th><th>Policy</th><th>Amt</th><th>Action</th></tr></thead>
            <tbody>
              {claims.map(c => (
                <tr key={c._id}>
                  <td>{c.userName}</td>
                  <td>{c.policyName}</td>
                  <td>${c.claimAmount}</td>
                  <td>
                    <button onClick={() => handleAction(c._id, 'Approved')}>Approve</button>
                    <button onClick={() => handleAction(c._id, 'Rejected')}>Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

function App() {
  const [user, setUser] = useState(null);
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