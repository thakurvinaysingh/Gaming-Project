const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const TransactionSchema = new Schema({
  amount: {
    type: Number,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
});

const WalletSchema = new Schema({
  balance: {
    type: Number,
    default: 0,
  },
  transactions: [TransactionSchema],
});

module.exports = mongoose.model('wallet', WalletSchema);
