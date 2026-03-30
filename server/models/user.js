const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String, 
        default: 'user' // 'admin' or 'user'
    },
    
    // --- Insurance Specific Fields ---
    totalPaid: { 
        type: Number, 
        default: 0 
    },
    availableCoverage: { 
        type: Number, 
        default: 0 
    },
    policyStatus: { 
        type: String, 
        enum: ['Active', 'Lapsed', 'Inactive'], 
        default: 'Inactive' 
    }
}, { timestamps: true }); // Good practice to track when users joined

module.exports = mongoose.model('User', UserSchema);