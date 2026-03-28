import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import { loginAPI, getPoliciesAPI, applyPolicyAPI, getAllClaimsAPI, getMyClaimsAPI, approveClaimAPI } from './services/api';
import Register from './pages/Register';
import { Shield, User, LogOut } from 'lucide-react'; // Icons


// --- LOGIN PAGE ---
// --- LOGIN PAGE (UPDATED) ---
const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    // Novelty: Simple Validation
    if (!email.includes('@')) { setError("Please enter a valid email."); return; }

    try {
      const user = await loginAPI(email, password);
      setUser(user);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div className="container login-box card">
      <Shield size={48} color="#4f46e5" style={{marginBottom:'20px'}} />
      <h2>Insurance Portal</h2>
      <form onSubmit={handleLogin}>
        <div className="input-group">
          <label>Email</label>
          <input className="input"  value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input className="input" type="password"  value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="btn">Login Securely</button>
        {error && <p className="error-msg">{error}</p>}
      </form>

      {/* --- NEW REGISTER LINK SECTION --- */}
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
         <p>Don't have an account? <Link to="/register" style={{ color: '#4f46e5' }}>Register here</Link></p>
      </div>
      {/* --------------------------------- */}

    </div>
  );
};

// --- USER DASHBOARD ---
const UserDashboard = ({ user }) => {
  const [policies, setPolicies] = useState([]);
  const [myPolicies, setMyPolicies] = useState([]);

  // 1. Fetch available policies
  useEffect(() => {
    getPoliciesAPI().then(setPolicies);
  }, []);

  // 2. Fetch MY applied policies from the database
  const fetchClaims = async () => {
    if (user?.id) {
      const claims = await getMyClaimsAPI(user.id);
      setMyPolicies(claims);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [user]); // Run this when user loads

  const handleApply = async (policy) => {
    if (confirm(`Apply for ${policy.name}?`)) {
      // 3. Send application to backend
      await applyPolicyAPI(user.id, user.email, policy);
      
      // 4. Refresh the list from the database immediately
      await fetchClaims();
      
      alert("Application Submitted!");
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <h3>Welcome, {user.name}</h3>
        <button className="btn btn-outline" onClick={() => window.location.reload()}> <LogOut size={16}/> Logout</button>
      </div>

      <h3>Available Insurance Plans</h3>
      <div className="card-grid">
        {policies.map(p => (
          <div key={p.id} className="card">
            <div style={{display:'flex', justifyContent:'space-between'}}>
              <h4>{p.name}</h4>
              <Shield size={20} color="#4f46e5"/>
            </div>
            <p style={{color:'#666'}}>{p.desc}</p>
            <h3 style={{color:'#4f46e5'}}>${p.cost}/year</h3>
            <button className="btn" onClick={() => handleApply(p)}>Apply Now</button>
          </div>
        ))}
      </div>

      <h3 style={{marginTop:'40px'}}>My Applied Policies</h3>
      {myPolicies.length === 0 ? <p>No policies yet.</p> : (
        <div className="card">
          <table width="100%" style={{borderCollapse:'collapse'}}>
            <thead><tr style={{textAlign:'left'}}><th>Policy</th><th>Date</th><th>Status</th></tr></thead>
            <tbody>
              {myPolicies.map((p, idx) => (
                <tr key={idx} style={{borderBottom:'1px solid #eee', height:'40px'}}>
                  {/* Note: The backend returns 'policyName', not 'name' */}
                  <td>{p.policyName}</td> 
                  <td>{p.date}</td>
                  <td><span className={`status-badge status-${p.status}`}>{p.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// --- ADMIN DASHBOARD ---
// --- ADMIN DASHBOARD (UPDATED) ---
const AdminDashboard = () => {
  const [claims, setClaims] = useState([]);

  // Fetch all claims when page loads
  useEffect(() => {
    loadClaims();
  }, []);

  const loadClaims = () => {
    getAllClaimsAPI().then(setClaims);
  };

  const handleApprove = async (claimId) => {
    if(confirm("Approve this policy?")) {
      await approveClaimAPI(claimId); // Call the backend
      loadClaims(); // Refresh the list to show "Approved"
    }
  };

  return (
    <div className="container">
      <div className="navbar">
        <h3>Admin Panel</h3>
        <button className="btn btn-outline" onClick={() => window.location.reload()}>Logout</button>
      </div>
      
      <div className="card">
        <h3>All User Applications</h3>
        {claims.length === 0 ? <p>No applications found.</p> : (
          <table width="100%" cellPadding="10">
            <thead>
              <tr style={{textAlign:'left', background:'#f9fafb'}}>
                <th>User Name</th>
                <th>Policy</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id} style={{borderBottom:'1px solid #eee'}}>
                  <td>
                    {claim.userName}
                    {/* We can show userId if we want, but name is better */}
                    <br/><small style={{color:'#999'}}>ID: {claim.userId}</small>
                  </td>
                  <td>{claim.policyName}</td>
                  <td>
                    <span className={`status-badge status-${claim.status}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td>
                    {claim.status === 'Pending' ? (
                      <button 
                        className="btn" 
                        style={{padding:'5px 10px', fontSize:'0.8em'}}
                        onClick={() => handleApprove(claim._id)}
                      >
                        Approve
                      </button>
                    ) : (
                      <span style={{color:'green', fontWeight:'bold'}}>Done</span>
                    )}
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

// --- MAIN ROUTER ---
// --- MAIN ROUTER (UPDATED) ---
function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        
        {/* --- NEW REGISTER ROUTE --- */}
        <Route path="/register" element={<Register />} />
        {/* -------------------------- */}

        <Route path="/dashboard" element={user ? <UserDashboard user={user} /> : <Login setUser={setUser} />} />
        <Route path="/admin" element={user?.role === 'admin' ? <AdminDashboard /> : <Login setUser={setUser} />} />
      </Routes>
    </Router>
  );
}

export default App;