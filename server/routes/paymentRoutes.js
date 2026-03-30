const express = require('express');
const router = express.Router();
const Payment = require('../models/payment');
const User = require('../models/user');

// @route   POST /api/payments/pay
router.post('/pay', async (req, res) => {
    try {
        const { amount, userId } = req.body; 

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Convert amount to number to avoid string concatenation bugs
        const paymentAmount = Number(amount);

        // 1. Update Total Paid
        user.totalPaid += paymentAmount;

        // 2. Set Multiplier (3x Logic)
        user.availableCoverage = user.totalPaid * 3; 

        // 3. Activate Policy if it was inactive
        user.policyStatus = 'Active';

        await user.save();

        res.json({ 
            message: "Payment Successful!", 
            totalPaid: user.totalPaid, 
            newLimit: user.availableCoverage 
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;