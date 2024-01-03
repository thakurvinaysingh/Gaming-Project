const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const otpSchema = new Schema({
    email: {
        type: String,
        required: true,
    },
    OTP: {
        type: Number,
        required: true,
    },
    expirationDate: {
        type: Date,
        required: true,
    },
});

const OTPmodel = mongoose.model('OTPmodel', otpSchema);

module.exports = OTPmodel;
