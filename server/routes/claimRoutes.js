const express = require('express');
const router = express.Router();
const Claim = require('../models/claim');
const User = require('../models/user');

// @route   POST /api/claims/request
router.post('/request', async (req, res) => {
    try {
        const { userId, policyType, claimAmount, reason } = req.body;
        const requestedAmount = Number(claimAmount);

        const user = await User.findById(userId);
        
        // Validation Logic: Check if they are within their 3x limit
        if (requestedAmount > user.availableCoverage) {
            return res.status(400).json({ 
                message: `Claim Denied. Your 3x coverage limit is $${user.availableCoverage}. 
                          You requested $${requestedAmount}.` 
            });
        }

        // Create the claim if within limits
        const newClaim = new Claim({
            user: userId,
            policyType,
            claimAmount: requestedAmount,
            reason,
            status: 'Pending' 
        });

        await newClaim.save();
        res.status(201).json({ 
            message: "Claim submitted for admin review.", 
            remainingCoverage: user.availableCoverage - requestedAmount 
        });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   GET /api/claims/admin/pending
// Gets all claims that haven't been reviewed yet
router.get('/admin/pending', async (req, res) => {
    try {
        const pendingClaims = await Claim.find({ status: "Pending" });
        res.json(pendingClaims);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route   PUT /api/claims/admin/update/:id
// Admin approves or rejects a specific claim
router.put('/admin/update/:id', async (req, res) => {
    try {
        const { status } = req.body; // status will be "Approved" or "Rejected"
        const claim = await Claim.findById(req.params.id);

        if (!claim) return res.status(404).json({ message: "Claim not found" });

        // LOGIC: If Approved, we subtract the claimAmount from the user's coverage
        if (status === "Approved") {
            const user = await User.findById(claim.userId);
            
            // Formula: $NewCoverage = OldCoverage - ClaimAmount$
            user.availableCoverage -= claim.claimAmount;
            await user.save();
        }

        claim.status = status;
        await claim.save();

        res.json({ message: `Claim ${status} successfully`, claim });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;