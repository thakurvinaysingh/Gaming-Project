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
            const alreadyemail = await this.repository.FindEmail({ email })
            if (alreadyemail) {
                return ({ success: false, message: "Email is already Exist!" });
            }

            const alreadyPhone = await this.repository.FindPhone({ phone })
            if (alreadyPhone) {
                return ({ success: false, message: "Phone is already Exist!" });
            }

            let salt = await GenerateSalt();

            let userPassword = await GeneratePassword(password, salt);


            const existingUser = await this.repository.UserCreate({ name, email, password: userPassword, phone, salt });
            // const token = await GenerateSignature({ email: email, _id: existingUser._id });
            return ({ success: true, message: "User added successfully", data: existingUser });

        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false, message: "check your Inputs " })
        }
    }

    async SignIn(userInputs, res) {
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
                if (!ValidPassword) return ({ success: false, message: "User Password  Not Match!" })

                if (ValidPassword) {
                    console.log("valid")
                    const token = await GenerateSignature({ email: existingUser.email, _id: existingUser._id }, res)
                    return ({ success: true, message: "Login  Successfully!", data: existingUser, token })
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

        try {

            const addressResult = await this.repository.CreateAddress({ _id, street, postalCode, city, country })
            return addressResult;

        } catch (error) {
            console.log(error)
            return res.status(500).json({ success: false, message: "Check Your Credentials!" })
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

                        const result = await this.repository.UpdatePass(email, newPassword)
                        console.log("Password updated ");
                        return result;
                    } else {
                        console.log("OPT is expired.");
                        return { success: false, message: 'OTP is expired.' };
                    }
                } else {
                    console.log("OPT is not existing.");
                    return { success: false, message: 'OTP is not existing.' };
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

    //-------------------------------User mangement / CRUD Operation ----------------------------------------//

    async updateStatus(Id) {
        try {
            console.log("UserId ", Id)
            const result = await this.repository.Status(Id)
            return result;
        } catch (error) {
            console.log(error)
            return { success: false, message: "Check Your User Id" }
        }
    }

    async UserUpdate(userId, userInputs) {
        try {
            console.log("UserId ", userId)
            const result = await this.repository.UpdateUser(userId, userInputs)
            return result;
        } catch (error) {
            console.log(error)
            return { success: false, message: "Check Your User Id" }
        }
    }

    async UserDelete(userId) {
        try {
            console.log("UserId ", userId)
            const result = await this.repository.DeleteUser(userId)
            return result;
        } catch (error) {
            console.log(error)
            return { success: false, message: "Check Your User Id" }
        }
    }

    async allUserList() {
        try {

            const result = await this.repository.userAllList()
            return result;
        } catch (error) {
            console.log(error)
            return { success: false, message: "Data Not found" }
        }
    }
    //-------------------------------User mangement / CRUD Operation ----------------------------------------//

    //-------------------------------User Transaction Tracker-----------------------------------------------//

    async UserTransaction(userId, userInputs) {
        try {
            console.log("userId", userId)
            const result = await this.repository.TransactionUser(userId, userInputs)
            if (result) {
                return result;
            } else {
                return { success: false, message: "Check Your user Id" }
            }

        } catch (error) {
            console.log(error)
            return { success: false, message: "Invalid User Id!" }
        }
    }

    async UserTransactionList() {
        try {

            const result = await this.repository.ListUserTransaction()
            return result;
        } catch (error) {
            console.log(error)
            return { success: false, message: "Data Not found" }
        }
    }

    async UserStatusTransaction(TranId, adminId, status) {
        try {

            const transaction = await this.repository.TransactionId(TranId)
            const admin = await this.repository.AdminId(adminId)
            console.log("user", transaction)
            console.log("admin", admin)
            if (!transaction || !admin) {
                return { success: false, message: "User or Admin not found" };
            }
            if (transaction.status === 'pending') {
                if (status === '1') {
                    // Update the status of the transaction to 'approved'
                    transaction.status = 'approved';
                    await transaction.save();

                    // Transfer the amount to the user's wallet
                    console.log("userId", transaction.userId);
                    const user = await this.repository.UserId(transaction.userId);

                    console.log("user", user);
                    if (user) {
                        user.wallet += transaction.amount;
                        await user.save();
                        return { success: true, message: "Transaction status updated Approved successfully" };
                    } else {
                        return { success: false, message: "User not found for the transaction" };
                    }
                } else if (status === '0') {
                    // If the status is 'cancel', update the transaction status to 'cancel'
                    transaction.status = 'cancel';
                    await transaction.save();
                    return { success: true, message: "Transaction status updated Cancel successfully" };
                } else {
                    return { success: false, message: "Invalid status provided" };
                }
            } else {
                return { success: false, message: "Transaction is not pending for approval" };
            }

        } catch (error) {
            console.log(error)
            return { success: false, message: "Check Your Credentials!" }
        }
    }

    //-------------------------------User Transaction Tracker-----------------------------------------------//


}



//------------------------------------//
module.exports = UserService;