const BankService = require("../services/bank-service");

const { uploadOptions } = require("../utils");

// all ban acount router handler
module.exports = (app) => {
    const service = new BankService();
    app.post("/bankaccount", uploadOptions.single('imageBarcode'), async (req, res, next) => {
        try {


            const { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode } = req.body;


            if (!bankName || !accountNumber || !accountHolderName || !ifscCode || !upiId) {
                return res.status(400).json({ success: false, message: "Please provide valid BankName, AccountNumber, AccountHolderName, IFScCode,upiId and Barcode " });
            }
            const userInputs = { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode }

            const data = await service.Bankfile(req, res, userInputs);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data  not found" })
            }
        } catch (err) {
            console.log(err)
            return res.status(503).json({ success: false, message: "check Your Credentials" })
        }
    });

    app.post("/bankaccount/:id", uploadOptions.single('imageBarcode'), async (req, res, next) => {
        try {
           const id = req.params.id;

            const { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode } = req.body;


            if (!bankName || !accountNumber || !accountHolderName || !ifscCode || !upiId) {
                return res.status(400).json({ success: false, message: "Please provide valid BankName, AccountNumber, AccountHolderName, IFScCode,upiId and Barcode " });
            }
            const userInputs = { bankName, accountNumber, accountHolderName, ifscCode, upiId, imageBarcode }

            const data = await service.UpdateBankfile(req, res, userInputs,id);
            if (data) {
                return res.json(data);
            } else {
                return res.status(404).json({ success: false, message: "Data  not found" })
            }
        } catch (err) {
            console.log(err)
            return res.status(503).json({ success: false, message: "check Your Credentials" })
        }
    });
    app.get("/bankaccount/:id", async (req, res) => {
        try {
            const BankId = req.params.id;
            const data = await service.GetbankAccount(BankId);
            if (data) {
                return res.json( data );
            } else {
                return res.status(404).json({ success: false, message: "Bank details not found" });
            }

        } catch (error) {
            console.log(err)
            return res.status(503).json({ success: false, message: "check Your Credentials" })
        }

    })

    app.get("/bankaccount/delete/:id", async (req, res) => {
        try {
            const BankId = req.params.id;
            const data = await service.DeleteBankAccount(BankId);
            if (data) {
                return res.json( data );
            } else {
                return res.status(404).json({ success: false, message: "Data not found" });
            }

        } catch (error) {
            console.log(err)
            return res.status(503).json({ success: false, message: "check Your Credentials" })
        }

    })

}