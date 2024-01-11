const { BankRepository } = require("../database");


//All BankAccount-Bussiness logic
class BankService {

    constructor() {
        this.repository = new BankRepository();
    }


    async Bankfile(req, res, userInputs) {

        const { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode } = userInputs;

        try {

            const addressResult = await this.repository.CreateBank(req, res, { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode })
            return ({ success: true, message: "Bank Details added Successfully!", data: addressResult });

        } catch (error) {
            console.log(error)
            return res.status(503).json({ success: false, message: "Check Credentials!" })
        }


    }

    async UpdateBankfile(req, res, userInputs,id) {

        const { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode } = userInputs;

        try {

            const addressResult = await this.repository.UpdateCreateBank(req, res, { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode },id)
            return  addressResult ;

        } catch (error) {
            console.log(error)
            return res.status(503).json({ success: false, message: "Check Credentials!" })
        }


    }

    async GetbankAccount(BankId) {
        try {
         const result = await this.repository.GetDetails(BankId);
         return result;
        } catch (error) {
            console.log(error)
            return res.status(503).json({ success: false, message: "Data Not found" })
        }

    }

    async DeleteBankAccount(BankId) {
        try {
         const result = await this.repository.Delete(BankId);
         return result;
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, message: "Data Not found" })
        }

    }
    async AllListBank(){
        try {
            
            const result = await this.repository.GetBankListAll()
            return result;
        } catch (error) {
            console.log(error)
            return {success:false,message:"Data Not found"}
        }
    }

}
module.exports = BankService;