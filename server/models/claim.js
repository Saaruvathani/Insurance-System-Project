const mongoose = require('mongoose');

const ClaimSchema = new mongoose.Schema({
    userId: String,
    userName: String,      // Save name so Admin sees it easily
    policyName: String,    // Save policy name
    status: { type: String, default: "Pending" },
    date: { type: String, default: new Date().toLocaleDateString() }
});

module.exports = mongoose.model('Claim', ClaimSchema);