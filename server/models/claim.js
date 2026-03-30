const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    // Better to use ObjectId so you can "populate" user details later if needed
    userId: { 
        type: String, 
        ref: 'User', 
        required: true 
    },
    userName: String,
    policyName: String, 
    
    // CRITICAL: You need this to check against the 3x limit!
    claimAmount: { 
        type: Number, 
        required: true 
    },
    
    reason: String, // Good to have for the admin to review
    status: { 
        type: String, 
        default: "Pending" 
    },
    
    // FIX: Using Date type is better for sorting and filtering
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Claim', ClaimSchema);