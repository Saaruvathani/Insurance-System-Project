require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const UserModel = require('./models/user');
const ClaimModel = require('./models/claim');

const app = express();
app.use(cors({
  origin: [
    'https://insurance-system-project.vercel.app',
    'https://insurance-system-project-git-main-saaruvathanis-projects.vercel.app',
    'http://localhost:5173'  // keep this for local dev
  ],
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Insurance System API is live and connected to MongoDB Atlas!");
});

const dbURI = process.env.MONGO_URI;
mongoose.connect(dbURI, { family: 4 })
    .then(() => console.log("Connected to MongoDB Atlas"))
    .catch(err => { console.error("Connection error", err.message); });

// ==========================================
// AUTH ROUTES
// ==========================================
app.get('/test', (req, res) => {
    res.json({ message: "Server is working!" });
});

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
        const newUser = await UserModel.create({
            username,
            email,
            password,
            role: 'user',
            totalPaid: 0,
            availableCoverage: 0
        });
        res.json({ status: "ok", user: newUser });
    } catch (error) {
        res.status(500).json({ error: "Database error" });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await UserModel.findOne({ email });
    if (user) {
        if (user.password === password) {
            res.json({ status: "ok", message: "Login Success", role: user.role, user });
        } else {
            res.json({ status: "error", message: "Incorrect Password" });
        }
    } else {
        res.json({ status: "error", message: "User not found" });
    }
});

// ==========================================
// CLAIMS ROUTES
// ==========================================

app.post('/apply', async (req, res) => {
    try {
        console.log("REQ BODY:", req.body); // ← debug log
        const { userId, userName, policyName, claimAmount } = req.body;
        const newClaim = await ClaimModel.create({
            userId,
            userName,
            policyName,
            claimAmount,
            status: "Pending"
        });
        console.log("✅ CLAIM SAVED SUCCESS!");
        res.json({ status: "ok", claim: newClaim });
    } catch (err) {
        console.error("❌ Database Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// GET all claims (admin) — must come BEFORE /claims/:userId
app.get('/claims', async (req, res) => {
    try {
        const claims = await ClaimModel.find();
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET claims for a specific user
app.get('/claims/:userId', async (req, res) => {
    try {
        const claims = await ClaimModel.find({ userId: req.params.userId });
        res.json(claims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Approve / Reject a claim (admin)
// Approve / Reject a claim (admin)
app.post('/approve', async (req, res) => {
    try {
        const { claimId, status } = req.body;
        
        console.log("📩 Received:", { claimId, status }); // ← check if status is coming in

        const claim = await ClaimModel.findByIdAndUpdate(
            claimId, 
            { status: status || "Approved" },
            { new: true }
        );

        console.log("📋 Claim found:", claim); // ← check if claim exists & has claimAmount

        if (status === 'Approved') {
            const updatedUser = await UserModel.findByIdAndUpdate(claim.userId, {
                $inc: { availableCoverage: -claim.claimAmount }
            }, { new: true });

            console.log("👤 User after deduction:", updatedUser.availableCoverage); // ← check if deduction worked
        }

        res.json({ status: "ok" });
    } catch (err) {
        console.error("❌ Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// ==========================================
// USER & PAYMENT ROUTES
// ==========================================

app.get('/api/users', async (req, res) => {
    try {
        const users = await UserModel.find();
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/profile/:userId', async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        res.json({
            totalPaid: user.totalPaid || 0,
            availableCoverage: user.availableCoverage || 0
        });
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.post('/api/payments/pay', async (req, res) => {
    try {
        const { userId, amount } = req.body;
        const paymentAmount = Number(amount);
        const user = await UserModel.findById(userId);
        if (!user) return res.status(404).json({ error: "User not found" });
        user.totalPaid = (user.totalPaid || 0) + paymentAmount;
        user.availableCoverage = (user.availableCoverage || 0) + (paymentAmount * 3);
        await user.save();
        res.json({ status: "ok", message: "Payment processed!" });
    } catch (err) {
        res.status(500).json({ error: "Payment failed" });
    }
});

// ==========================================
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});