require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/user');
const ClaimModel = require('./models/claim'); // <--- 1. NEW IMPORT

const app = express();
app.use(express.json()); 
app.use(cors()); 

const dbURI = process.env.MONGO_URI;
// CONNECTION TO LOCAL MONGODB
mongoose.connect(dbURI,{
    family:4
})
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => {console.error("Connection error", err.message);});

// REGISTER ROUTE 
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        return res.status(400).json({ error: "All fields are required" });
    }

    try {
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: "User already exists" });
        }
        const newUser = await UserModel.create({ username, email, password });
        res.json({ status: "ok", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

// LOGIN ROUTE (UPDATED)
app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email: email });

    if (user) {
        if (user.password === password) {
            // <--- 2. UPDATED RESPONSE: Send the full 'user' object so frontend gets the _id
            res.json({ status: "ok", message: "Login Success", role: user.role, user: user });
        } else {
            res.json({ status: "error", message: "Incorrect Password" });
        }
    } else {
        res.json({ status: "error", message: "User not found" });
    }
});

// --- 3. NEW ROUTES FOR CLAIMS ---

// User Applies for a Policy
app.post('/apply', async (req, res) => {
    try {
        const { userId, userName, policyName } = req.body;
        const newClaim = await ClaimModel.create({ 
            userId, 
            userName, 
            policyName,
            status: "Pending",
            date: new Date().toLocaleDateString()
        });
        res.json({ status: "ok", claim: newClaim });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get Claims for a Specific User (Dashboard)
app.get('/claims/:userId', async (req, res) => {
    try {
        const claims = await ClaimModel.find({ userId: req.params.userId });
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get ALL Claims (For Admin Dashboard)
app.get('/claims', async (req, res) => {
    try {
        const claims = await ClaimModel.find();
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve a Claim (Admin Action)
app.post('/approve', async (req, res) => {
    try {
        const { claimId } = req.body;
        await ClaimModel.findByIdAndUpdate(claimId, { status: "Approved" });
        res.json({ status: "ok" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3001; 
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});