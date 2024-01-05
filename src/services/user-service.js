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

        const { name, email, password, phone } = userInputs;
        try {
           const alreadyemail = await this.repository.FindEmail({email})
            if (alreadyemail) {
                return ({ success: false, message: "User is already Exist" });
            }

            const alreadyPhone = await this.repository.FindPhone({phone})
            if (alreadyPhone) {
                return ({ success: false, message: "User is already Phone" });
            }

            let salt = await GenerateSalt();

            let userPassword = await GeneratePassword(password, salt);


            const existingUser = await this.repository.UserCreate({ name, email, password: userPassword, phone, salt });
            // const token = await GenerateSignature({ email: email, _id: existingUser._id });
            return ({ success: true, message: "User added successfully", data: existingUser });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false })
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
                if (!ValidPassword) return ({ success: "false", message: "User Password  Not Match!" })

                if (ValidPassword) {
                    console.log("valid")
                    const token = await GenerateSignature({ email: existingUser.email, _id: existingUser._id })
                    return ({ success: "true", message: "Login  Successfully!", data: existingUser, token })
                }
            }

            return { success: true, message: ' User is Not Found' };
        } catch (error) {
            console.log(error)
            return res.status(400).json({ success: false, message: 'Check your Inputs' })
        }
    }


    async AddNewAddress(_id, userInputs) {

        const { street, postalCode, city, country } = userInputs;
        console.log("child")
        try {
            console.log("child")
            const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city, country })
            return ({ success: true, message: "Address is added Successfully!", data: addressResult });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false, message })
        }


    }

    async GetProfile(id) {

        try {
            const existingCustomer = await this.repository.FindCustomerById({ id });
            console.log(existingCustomer)
            if (existingCustomer) {
                return ({ success: true, message: "list of all User Information!", data: existingCustomer });
            }
            return ({ success: false, message: "User is Not found!" })

        } catch (error) {
            console.error(error);
            return { success: false, message: 'Internal server error.' };
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
            <p>OPT:${data.data.OTP}</p>
            <p>Please keep your account details secure.</p>
            <p>Please Login Your new Password </p>
        `;
            await sendEmail(email, 'Password Reset', emailHtml);

            return data;

        } catch (err) {
            console.log(err)
            return { success: false, message: 'Check your Email Address!' };
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

                        await this.repository.UpdatePass(email, newPassword)
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
                return { success: false, message: 'Check Your Credential details.' };
            }
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Internal server error.' };
        }
    }
    async ChangePassword(user, curentpassword, newPassword) {
        try {

            const data = await this.repository.ChangePass(user, curentpassword, newPassword)

            return data;
        } catch (error) {
            console.error(error);
            return { success: false, message: 'Check Your Credentials Details!' };
        }
    }

}
//--------function -------------//


//------------------------------------//
module.exports = UserService;