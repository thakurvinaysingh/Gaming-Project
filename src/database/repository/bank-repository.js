const { BankAccount } = require("../models");


class BankRepository {
    async CreateBank(req, res, { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode }) {
        try {

            const file = req.file;
            if (!file) return res.status(400).json('No image in the request')

            const fileName = file.filename
            const basePath = `${req.protocol}://${req.get('host')}/uploads/`;

            const bank = new BankAccount({
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId,
                imageBarcode: `${basePath}${fileName}`
            });
            const bankResult = await bank.save();
            return bankResult;
        } catch (err) {
            console.log("repository Error")
            console.log(err);
            return { success: false, message: 'Internal server error.' };

        }
    }

    async UpdateCreateBank(req, res, { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode },id) {
        try {

            const file = req.file;
            if (!file) return res.status(400).json('No image in the request')

            const fileName = file.filename
            const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

            const bank = await BankAccount.findByIdAndUpdate(id,{
                bankName,
                accountNumber,
                accountHolderName,
                ifscCode,
                upiId,
                imageBarcode: `${basePath}${fileName}`
            },
            { new: true });
           if(bank){
            return {success:true,message:"Update Successfully!",data:bank};
           }else{
            return {success:false,message:"Failed to Update Bank Account Details!"}
           }
          
        } catch (err) {
            console.log("repository Error")
            console.log(err);
            return { success: false, message: 'Internal server error.' };

        }
    }
    async GetDetails(BankId) {
       
        try {
            console.log(BankId);
            const Details = await BankAccount.findById( BankId )
            if (Details) {
                return {success:true, data:Details}
            } else {
                return {success:false,message:"Bank details not found."}
            }
        } catch (error) {
            console.log(error);
            return { success: false, message: 'Invalid Bank Account Id!' };
        }
    }
  
    async Delete(BankId) {
       
        try {
            console.log(BankId);
            const Details = await BankAccount.findByIdAndDelete( BankId )
            if (Details) {
                return {success:true,message:"Bank Account Details is Deleted!", data:Details}
            } else {
                return {success:false,message:"Data not found."}
            }
        } catch (error) {
            console.log(error);
            return { success: false, message: 'Invalid Bank Acount Id!' };
        }
    }
}

module.exports = BankRepository;