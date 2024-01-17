const mongoose = require('mongoose');

const WithdrawalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    },
    amount: Number,
    bankName: {
        type: String,
        required: true
    },
    accountNumber: {
        type: String,
        required: true
    },
    accountHolderName: {
        type: String,
        required: true
    },
    ifscCode: {
        type: String,
        required: true
    },
    mobile: {
        type: String
    },
    upiId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['approved', 'cancel', 'pending'],
        default: 'pending'
    }
}, {
    toJSON: {
        transform(doc, ret) {
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
        }
    },
    timestamps: true
}
);

module.exports = mongoose.model('Withdrawal', WithdrawalSchema); 