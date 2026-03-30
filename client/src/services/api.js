import axios from 'axios';

const API_URL = "https://insurance-system-project.onrender.com";

export const registerUser = async (userData) => {
    try {
        // We use axios here to keep it consistent with the rest of your app
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

export const fetchUserProfileAPI = async (userId) => {
    const response = await axios.get(`${API_URL}/api/users/profile/${userId}`);
    return response.data;
};

export const payPremiumAPI = async (userId, amount) => {
    const response = await axios.post(`${API_URL}/api/payments/pay`, { userId, amount });
    return response.data;
};

export const getPoliciesAPI = async () => {
    return [
        { id: 1, name: 'Health Shield', cost: 200, desc: 'Basic coverage for general health.' },
        { id: 2, name: 'Car Protect', cost: 150, desc: 'Damage and third-party liability.' },
        { id: 3, name: 'Home Safe', cost: 500, desc: 'Fire and natural disaster coverage.' },
        { id: 16, name: 'Gadget Master', cost: 120, desc: 'Theft and accidental damage for tech.' }
    ];
};

export const applyPolicyAPI = async (userId, username, policy) => {
    const response = await axios.post(`${API_URL}/api/claims/request`, { 
        userId, 
        userName: username,
        policyName: policy.name,
        claimAmount: policy.cost 
    });
    return response.data;
};

export const getMyClaimsAPI = async (userId) => {
    const response = await axios.get(`${API_URL}/api/claims/my-claims/${userId}`);
    return response.data;
};

export const fetchPendingClaims = async () => {
    const response = await axios.get(`${API_URL}/api/claims/admin/pending`);
    return response.data;
};

export const updateClaimStatus = async (id, status) => {
    const response = await axios.put(`${API_URL}/api/claims/admin/update/${id}`, { status });
    return response.data;
};