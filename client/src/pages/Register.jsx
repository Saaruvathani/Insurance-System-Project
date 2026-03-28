import { useState } from 'react';
import { registerUser } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const navigate = useNavigate();

    async function handleSubmit(e) {
        e.preventDefault();
        
        // Novelty: Validation
        if(password.length < 6) {
            alert("Password must be at least 6 characters");
            return;
        }

        const result = await registerUser({ username: name, email, password });
        
        if (result.status === 'ok') {
            alert('Registration Successful!');
            navigate('/'); // Redirect to login
        } else {
            alert('Error: ' + result.error);
        }
    }

    return (
        <div className="register-page">
            <div className="glass-card">
                <h2>Create Account</h2>
                
                <form onSubmit={handleSubmit}>
                    
                    {/* Username Field */}
                    <div className="input-group">
                        <input 
                            type="text" 
                            className="glass-input" 
                            value={name} 
                            onChange={(e) => setName(e.target.value)} 
                            placeholder=" " /* Trick for floating label */
                            required
                        />
                        <label className="floating-label">Username</label>
                    </div>

                    {/* Email Field */}
                    <div className="input-group">
                        <input 
                            type="email" 
                            className="glass-input" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            placeholder=" " 
                            required
                        />
                        <label className="floating-label">Email Address</label>
                    </div>

                    {/* Password Field */}
                    <div className="input-group">
                        <input 
                            type="password" 
                            className="glass-input" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder=" " 
                            required
                        />
                        <label className="floating-label">Password</label>
                    </div>

                    <button type="submit" className="glow-btn">
                        Sign Up
                    </button>

                </form>

                <p style={{marginTop: '20px', fontSize: '0.9rem', color: '#666'}}>
                    Already have an account? <br/>
                    <Link to="/" style={{color: '#6366f1', textDecoration: 'none', fontWeight: 'bold'}}>
                        Login here
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Register;