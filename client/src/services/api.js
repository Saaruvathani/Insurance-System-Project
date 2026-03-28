const API_URL = "https://insurance-system-project.onrender.com";

// --- AUTHENTICATION ---
export const registerUser = async (userData) => {
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });
        return await response.json();
    } catch (error) {
        return { status: "error", error: error.message };
    }
};

export const loginAPI = async (email, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        
        if (data.status === 'ok') {
            // Include user ID so we can fetch their specific claims later
            return { 
                id: data.user._id, // IMPORTANT: MongoDB ID
                name: data.user.username, 
                email: email, 
                role: data.role 
            }; 
        } else {
            throw data.message;
        }
    } catch (error) {
        throw error;
    }
};

// --- POLICIES (Static Data is fine for now) ---
export const getPoliciesAPI = async () => {
    return [
        { id: 1, name: 'Health Shield', cost: 200, desc: 'Full coverage for health.' },
        { id: 2, name: 'Car Protect', cost: 150, desc: 'Damage protection for vehicle.' },
        { id: 3, name: 'Home Safe', cost: 500, desc: 'Fire and theft coverage.' }
    ];
};

// --- CLAIMS (Now connected to Database!) ---

// 1. Apply (User)
export const applyPolicyAPI = async (userId, userEmail, policy) => {
    // Note: I added userEmail/Name logic in the UI component to pass name
    await fetch(`${API_URL}/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            userId, 
            userName: userEmail.split('@')[0], // Simple way to get a name
            policyName: policy.name 
        })
    });
};

// 2. Get My Claims (User)
export const getMyClaimsAPI = async (userId) => {
    const res = await fetch(`${API_URL}/claims/${userId}`);
    return await res.json();
};

// 3. Get All Claims (Admin)
export const getAllClaimsAPI = async () => {
    const res = await fetch(`${API_URL}/claims`);
    return await res.json();
};

// 4. Approve Claim (Admin)
export const approveClaimAPI = async (claimId) => {
    await fetch(`${API_URL}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ claimId })
    });
};