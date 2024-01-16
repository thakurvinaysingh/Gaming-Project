const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user' 
  },
  name: String,
  phone: String,
  paymentType: {
    type: String,
    enum: ['credit', 'debit']
  },
  amount: Number,
  transactionId: String,
  status:{
    type:String,
    enum:['approved','cancel','pending'],
    default:'pending'
  }
},{
  toJSON: {
      transform(doc, ret){
          delete ret.password;
          delete ret.salt;
          delete ret.__v;
      }
  },
  timestamps: true
}
);

module.exports = mongoose.model('Transaction', TransactionSchema); 