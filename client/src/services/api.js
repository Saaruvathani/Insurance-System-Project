import axios from 'axios';

const API_URL = "https://insurance-system-project.onrender.com"; 

// --- AUTHENTICATION ---
export const registerUser = async (userData) => {
    try {
        const response = await axios.post(`${API_URL}/register`, userData);
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || "Registration failed";
    }
};

export const loginAPI = async (email, password) => {
    try {
        const response = await axios.post(`${API_URL}/login`, { email, password });
        if (response.data.status === 'ok') {
            return { 
                id: response.data.user._id, 
                username: response.data.user.username, 
                role: response.data.user.role || response.data.role 
            }; 
        }
        throw new Error(response.data.message);
    } catch (error) {
        throw error.response?.data?.message || error.message || "Login failed";
    }
};

// --- 3X MULTIPLIER & STATS ---
// Matches app.get('/api/users/profile/:userId') in index.js
export const fetchUserProfileAPI = async (userId) => {
    const response = await axios.get(`${API_URL}/api/users/profile/${userId}`);
    return response.data;
};

// Matches app.post('/api/payments/pay') in index.js
export const payPremiumAPI = async (userId, amount) => {
    const response = await axios.post(`${API_URL}/api/payments/pay`, { userId, amount });
    return response.data;
};

// --- POLICIES ---
export const getPoliciesAPI = async () => {
    return [
        // Original Policies
        { id: 1, name: 'Health Shield', cost: 200, desc: 'Basic coverage for general health.' },
        { id: 2, name: 'Car Protect', cost: 150, desc: 'Damage and third-party liability.' },
        { id: 3, name: 'Home Safe', cost: 500, desc: 'Fire and natural disaster coverage.' },
        { id: 16, name: 'Gadget Master', cost: 120, desc: 'Theft and accidental damage for tech.' },
        
        // Health & Wellness
        { id: 4, name: 'Dental Plus', cost: 50, desc: 'Covers routine cleanings, x-rays, and major dental procedures.' },
        { id: 5, name: 'Vision Focus', cost: 40, desc: 'Annual eye exams, frames, and contact lens coverage.' },
        { id: 6, name: 'Critical Care', cost: 280, desc: 'Lump-sum payout upon diagnosis of covered critical illnesses.' },
        { id: 7, name: 'Maternity Joy', cost: 250, desc: 'Comprehensive coverage for prenatal care and childbirth expenses.' },
        { id: 8, name: 'Senior Care Plus', cost: 180, desc: 'Supplemental health insurance tailored for adults over 65.' },
        
        // Property & Renters
        { id: 9, name: 'Renters Haven', cost: 110, desc: 'Protects your personal property against theft and fire in a rental.' },
        { id: 10, name: 'Landlord Peace', cost: 450, desc: 'Property damage and liability coverage for rental property owners.' },
        { id: 11, name: 'Flood Rescue', cost: 320, desc: 'Specialized coverage for water damage from natural floods.' },
        { id: 12, name: 'Earthquake Guard', cost: 400, desc: 'Structural and foundation protection against seismic activity.' },
        { id: 13, name: 'Appliance Extend', cost: 65, desc: 'Extended warranty and repair coverage for major home appliances.' },
        { id: 14, name: 'Solar Panel Guard', cost: 160, desc: 'Hail, wind, and debris damage coverage for home solar systems.' },
        
        // Auto & Transit
        { id: 15, name: 'Two-Wheeler Guard', cost: 85, desc: 'Comprehensive coverage for motorcycles and scooters.' },
        { id: 17, name: 'Bicycle Commuter', cost: 45, desc: 'Covers theft and transit damage for daily bike commuters.' },
        { id: 18, name: 'E-Scooter Safe', cost: 55, desc: 'Accident and liability coverage for electric scooter riders.' },
        { id: 19, name: 'RV Explorer', cost: 220, desc: 'Roadside assistance and collision coverage for recreational vehicles.' },
        { id: 20, name: 'Boat & Marine', cost: 310, desc: 'On-water liability, wreck removal, and physical damage coverage.' },
        
        // Lifestyle & Valuables
        { id: 21, name: 'Pet Med Protect', cost: 75, desc: 'Veterinary bills for accidents, illnesses, and routine checkups.' },
        { id: 22, name: 'Global Nomad', cost: 90, desc: 'Travel insurance covering flight cancellations and lost baggage.' },
        { id: 23, name: 'Event Saver', cost: 300, desc: 'Coverage for non-refundable deposits if your special event is canceled.' },
        { id: 24, name: 'Jewelry & Gem', cost: 190, desc: 'Loss, theft, and damage protection for high-value accessories.' },
        { id: 25, name: 'Musician\'s Muse', cost: 140, desc: 'Theft and damage protection for expensive musical instruments.' },
        
        // Tech & Cyber
        { id: 26, name: 'Phone Screen Pro', cost: 35, desc: 'Dedicated replacement and repair coverage for cracked screens.' },
        { id: 27, name: 'Cyber Armor', cost: 130, desc: 'Identity theft resolution and personal data breach protection.' },
        
        // Life & Business
        { id: 28, name: 'Term Life Secure', cost: 350, desc: 'Fixed-term life insurance to protect your family\'s future.' },
        { id: 29, name: 'Freelance Shield', cost: 210, desc: 'Professional liability and income disruption for gig workers.' },
        { id: 30, name: 'Small Biz Pack', cost: 600, desc: 'General liability and commercial property insurance for startups.' }
    ];
};


// --- CLAIMS ---
// Matches app.post('/apply') in index.js
export const applyPolicyAPI = async (userId, username, policy) => {
    const response = await axios.post(`${API_URL}/apply`, { 
        userId, 
        userName: username,
        policyName: policy.name,
        claimAmount: policy.cost
    });
    return response.data;
};

// Matches app.get('/claims/:userId') in index.js
export const getMyClaimsAPI = async (userId) => {
    const response = await axios.get(`${API_URL}/claims/${userId}`);
    return response.data;
};

// Matches app.get('/claims') in index.js
export const fetchPendingClaims = async () => {
    const response = await axios.get(`${API_URL}/claims`);
    return response.data;
};

// Matches app.post('/approve') in index.js
export const updateClaimStatus = async (claimId, status) => {
    console.log("📤 Sending to backend:", { claimId, status }); // ← add this
    const response = await axios.post(`${API_URL}/approve`, { claimId, status });
    console.log("📥 Backend response:", response.data); // ← add this
    return response.data;
};