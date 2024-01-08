const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bankAccountSchema = new Schema({
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
      upiId: {
        type: String,
        required: true
      },
      imageBarcode: {
        type: String, 
        required: true
      }
})

module.exports = mongoose.model('BankAccount',bankAccountSchema);