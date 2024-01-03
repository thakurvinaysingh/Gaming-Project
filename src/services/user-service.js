const { UserRepository } = require("../database");
const { OPTModel } = require("../database/models");
const { GeneratePassword, GenerateSalt, GenerateSignature, FormateData, ValidatePassword, GenerateOTP, sendEmail } = require("../utils");
const { APIError, BadRequestError } = require("../utils/app-errors");



//All Bussiness logic
class UserService {

    constructor() {
        this.repository = new UserRepository();
    }

    async Signup(userInputs) {

        const { email, password, phone } = userInputs;
        try {
            let salt = await GenerateSalt();

            let userPassword = await GeneratePassword(password, salt);

            const existingUser = await this.repository.UserCreate({ email, password: userPassword, phone, salt });
            const token = await GenerateSignature({ email: email, _id: existingUser._id });
            return FormateData({ id: existingUser._id, token });

        } catch (err) {
            console.log("services Error")
            throw new APIError("Data Not Found", err)
        }
    }

    async SignIn(userInputs) {
        const { email, password, phone } = userInputs;
        console.log("find inputs")
        try {
            console.log(email, password, phone)
            let existingUser;

            if (email) {
                existingUser = await this.repository.FindUser({ email });
            } else {
                existingUser = await this.repository.FindUser({ phone });
            }

            if (existingUser) {
                const ValidPassword = await ValidatePassword(password, existingUser.password, existingUser.salt)
                console.log("existingUser",ValidPassword)
                if (ValidPassword) {
                    console.log("valid")
                    const token = await GenerateSignature({ email: existingUser.email, _id: existingUser._id })
                    return FormateData({ id: existingUser._id, token })
                }
            }
            console.log("exist")
            return FormateData(null)
        } catch (error) {
            console.log(error)
            return res.status(500).json({success:false})
        }
    }


    async AddNewAddress(_id, userInputs) {

        const { street, postalCode, city, country } = userInputs;
        console.log("child")
        try {
            console.log("child")
            const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city, country })
            return FormateData(addressResult);

        } catch (err) {
            console.error('Error in AddNewAddress:', err);
            throw new APIError('Data Not found', err)
        }


    }

    async GetProfile(id) {

        try {
            const existingCustomer = await this.repository.FindCustomerById({ id });
            return FormateData(existingCustomer);

        } catch (err) {
            throw new APIError('Data Not found', err)
        }
    }

    async ForgetPassword(email) {

        try {

            let OTP = await GenerateOTP();
            let expirationDate = new Date();
            expirationDate.setMinutes(expirationDate.getMinutes() + 15);

            const data = await this.repository.StoreOPT({ OTP, email, expirationDate })
            const emailHtml = `
            <p>Email:${email}</p>
            <p>Your Forget Password</p>
            <p>OPT:${data.OPT}</p>
            <p>Please keep your account details secure.</p>
            <p>Please Login Your new Password </p>
        `;
            await sendEmail(email, 'Password Reset', emailHtml);


            return { data, message: 'OPT send successfully Your Email.' };

        } catch (err) {
            console.log(err)
            return null;
        }
    }

    async UpdatePassword(email, OTP, newPassword) {
        try {
            const existingOPT = await this.repository.checkOPT(email, OTP)

            console.log("existingOPT", existingOPT)

            if (existingOPT && existingOPT.success) {
                const currentDateTime = new Date();
                
                if (existingOPT.data.OTP === OTP) {
                    if (existingOPT.data.expirationDate > currentDateTime) {

                        await this.repository.ChangePassword(email,newPassword)
                        console.log("Password updated ");
                        return { success: true, message: 'Password updated successfully.' };
                    } else {
                        console.log("OPT is expired.");
                        return { success: false, message: 'OPT is expired.' };
                    }
                } else {
                    console.log("OPT is not existing.");
                    return { success: false, message: 'OPT is not existing.' };
                }
            } else {
                console.log("Invalid OPT.");
                return { success: false, message: 'Invalid OPT.' };
            }
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Internal server error.' };
        }
    }


}
//--------function -------------//


//------------------------------------//
module.exports = UserService;