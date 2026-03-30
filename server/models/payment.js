const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
    // Links this payment to a specific user
    userId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    // The amount they just paid (e.g., 100)
    amount: { 
        type: Number, 
        required: true 
    },

    // Optional: You can add 'Success' or 'Failed' if you add a real gateway later
    status: { 
        type: String, 
        default: 'Success' 
    },

    // The date the premium was paid
    date: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('Payment', PaymentSchema);