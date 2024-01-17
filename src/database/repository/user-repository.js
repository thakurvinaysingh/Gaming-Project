//Dealing with data base opertion
const { UserModel, AddressModel, OPTModel, Transaction, counterModel, WithdrawalModel } = require("../models");
const { GeneratePassword, GenerateSalt } = require("../../utils");
const { APIError, BadRequestError, STATUS_CODES } = require("../../utils/app-errors");
const bcrypt = require('bcrypt');

class UserRepository {
  async UserCreate({ name, email, password, phone, salt }) {
    try {
      const counter = await counterModel.findByIdAndUpdate(
        { _id: 'userId' },
        { $inc: { sequence_value: 1 } },
        { new: true, upsert: true }
      );

      const user = new UserModel({
        userId: counter.sequence_value,
        name,
        email,
        password,
        salt,
        phone,
        address: [],
      });
      const userResult = await user.save();
      return userResult;
    } catch (err) {
      console.log("repository Error")
      console.log(err);
      return { success: false, message: 'Internal server error.' };

    }
  }
  async FindEmail({ email }) {
    try {
      const existingUser = await UserModel.findOne({ email: email });
      return existingUser
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Internal server error.' };
    }
  }
  async FindPhone({ phone }) {
    try {
      const existingUser = await UserModel.findOne({ phone: phone });
      return existingUser
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Internal server error.' };
    }
  }
  async FindUser({ email, phone }) {

    try {

      let query = {};

      if (email) {
        query.email = email;
      } else if (phone) {
        query.phone = phone;
      } else {
        console.log("error is..");
        return { success: false, message: 'User Not found.' };
      }

      const existingUser = await UserModel.findOne(query);
      if (existingUser) {

        return existingUser;
      } else {
        console.log("error is eror");
        return { success: false, message: 'User Not Found!' }
      }

    } catch (error) {
      console.error(error);
      return { success: false, message: 'Internal server error.' };
    }
  }


  async CreateAddress({ _id, street, postalCode, city, country }) {

    try {
      const profile = await UserModel.findById(_id);

      if (profile) {
        const newAddress = new AddressModel({
          street,
          postalCode,
          city,
          country,
        });

        await newAddress.save();

        profile.address.push(newAddress);
      }

      return await profile.save();
    } catch (err) {
      console.error(err);
      return { success: false, message: 'Created failure' };
    }
  }

  async FindCustomerById({ id }) {
    try {
      const existingCustomer = await UserModel.findById(id)
        .populate("address");
      return existingCustomer;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'User Not found' };
    }
  }

  async StoreOPT({ OTP, email, expirationDate }) {

    try {

      const existingEmail = await UserModel.findOne({ email })
      // check the existing opt and deleted
      await OPTModel.findOneAndDelete({ email });

      if (existingEmail) {

        const newOPT = new OPTModel({
          OTP,
          email: existingEmail.email,
          expirationDate,
        });

        const data = await newOPT.save();
        console.log("OTP", data.OTP)
        return ({ success: true, message: "OTP send successfully Your Email.", data });
      } else {
        return ({ success: false, message: "Email is Not found" });
      }
    } catch (err) {
      console.log(err)
      return ({ success: false, message: "Credential is Validation" });
    }
  }

  async checkOPT(email) {
    try {
      const existingOPT = await OPTModel.findOne({ email });

      if (existingOPT) {
        // Check if the expiration date is valid
        const expirationDate = existingOPT.expirationDate;
        const OTP = existingOPT.OTP;
        return { success: true, data: { OTP, expirationDate } };
      } else {
        return { success: false, message: 'Email is Not Found.' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Internal server error.' };
    }
  }

  async UpdatePass(email, newPassword) {
    try {
      console.log("email", email)
      const user = await this.FindEmail({ email });

      if (user) {
        if (typeof newPassword !== 'string') {
          console.log("Invalid new password format");
          return { success: false, message: 'Invalid new password format.' };
        }
        const salt = await GenerateSalt();

        const hashedPassword = await GeneratePassword(newPassword, salt);

        user.password = hashedPassword;
        user.salt = salt;

        await user.save();
        console.log("Password updated successfully");
        return { success: true, message: 'Password updated successfully!' };
      } else {
        // No user found with the provided email
        console.log("User not found");
        return { success: false, message: 'User not found.' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Internal server error.' };
    }
  }

  async ChangePass(userId, currentPassword, newPassword) {
    try {
      const user = await UserModel.findById(userId);

      if (!user) {
        return { success: false, message: 'User not found.' };
      }

      const passwordMatch = await bcrypt.compare(currentPassword, user.password);

      if (!passwordMatch) {
        return { success: false, message: 'Current password is incorrect.' };
      }

      // Generate salt and hash the new password
      const salt = await GenerateSalt();
      const hashedPassword = await GeneratePassword(newPassword, salt);
      user.password = hashedPassword;
      user.salt = salt;
      await user.save();


      return { success: true, message: 'Password changed successfully.' };

    } catch (error) {
      console.error(error);
      return { success: false, message: 'Check Your Credential Details!.' };
    }
  }

  //-------------------------------User Mangement/ CRUD Operation-------------------------------------//

  async Status(Id) {
    console.log("status Id", Id)
    try {

      console.log("user infor", Id)
      const user = await UserModel.findById(Id);
      console.log("user", user)
      if (user) {
        console.log("user", user)
        if (user.status == true) {
          user.status = false;
          await user.save();
          return { success: true, message: "Status changed to InActive!" };
        } else {
          user.status = true;
          await user.save();
          return { success: true, message: "Status changed to Active!" };
        }

      } else {
        return { success: false, message: "User Not found" }
      }
    } catch (error) {
      console.log(error)
      return { success: false, message: "Check Your User Id !" }
    }
  }

  async UpdateUser(userId, userInputs) {
    try {
      const { name, email, phone, lastrecharge, s_promocode, promocode, comment, wallet, } = userInputs;
      console.log("Id", userId);
      const data = await UserModel.findByIdAndUpdate(userId, {
        name,
        email,
        phone,
        lastrecharge,
        s_promocode,
        promocode,
        comment,
        wallet,
      },
        { new: true });

      if (data) {
        return { success: true, message: "Update Successfully!", data }
      } else {
        return { success: false, message: "Failed to Update Bank Account Details!" }
      }
    } catch (error) {
      console.log(error)
      return { success: false, message: "Check Your User Id" }
    }
  }

  async DeleteUser(userId) {
    try {
      console.log(userId);
      const Details = await UserModel.findByIdAndDelete(userId)
      if (Details) {
        return { success: true, message: "User Id is Deleted!", data: Details }
      } else {
        return { success: false, message: "Data not found." }
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Invalid User Id' };
    }
  }
  async userAllList() {
    try {

      const list = await UserModel.find();
      if (list.length > 0) {

        return { success: true, message: "User Details retrieved successfully!", data: list };
      } else {
        return { success: false, message: "No User Details found." };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Data Not found' };
    }
  }
  async FindSingleUser(userId) {
    try {
      const existingCustomer = await UserModel.findById(userId)
        .populate("address");
      if (existingCustomer) {
        return { success: true, message: "User profile found", data: existingCustomer };
      } else {
        return { success: false, message: 'User not found' };
      }
    } catch (error) {
      console.error(error);
      return { success: false, message: 'User Not found' };
    }
  }
  //-------------------------------User Mangement/ CRUD Operation-------------------------------------//


  //-------------------------------User Transaction Tracker-------------------------------------//

  async TransactionUser(userId, userInputs) {
    try {
      const { paymentType, amount, transactionId } = userInputs;
      const date = new Date();

      const newTransaction = new Transaction({
        userId,
        paymentType,
        amount,
        date,
        transactionId,

      });
      const data = await newTransaction.save();
      if (data) {
        return { success: true, message: "Transaction added Successfully!", data };
      } else {
        return { success: false, message: "No User Details found." };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Check Your Credentials!' };
    }
  }

  async ListUserTransaction() {
    try {

      const list = await Transaction.find().populate('userId');
      if (list.length > 0) {

        return { success: true, message: "User Details retrieved successfully!", data: list };
      } else {
        return { success: false, message: "No User Details found." };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Data Not found' };
    }
  }

  async TransactionId(TranId) {
    try {
      const user = await Transaction.findById(TranId);
      console.log("user")
      if (user) {
        return user;
      } else {
        return { success: false, message: "Transaction_Id Not found" }
      }
    } catch (error) {
      console.log(error)
      return { success: false, message: "Check Your Transaction Id" }
    }
  }
  async AdminId(adminId) {
    try {
      const admin = await UserModel.findById(adminId);
      if (admin) {
        return admin;
      } else {
        return { success: false, message: "Admin Not found" }
      }
    } catch (error) {
      console.log(error)
      return { success: false, message: "Check Your User Id" }
    }
  }

  async UserId(Id) {
    try {
      const user = await UserModel.findById(Id);
      if (user) {
        return user;
      } else {
        return { success: false, message: "User Not found" }
      }
    } catch (error) {
      console.log(error)
      return { success: false, message: "Check Your User Id" }
    }
  }
  //-------------------------------User Transaction Tracker end-------------------------------------//

  //--------------------------------User Withdrawal Amount-------------------------------------------//
  async WithdrawalCreated({ userId, amount, bankName, accountNumber, accountHolderName, ifscCode, upiId }) {
    try {
      const user = await UserModel.findById(userId);

      if (!user || user.wallet < amount) {
        return { success: false, message: 'Insufficient funds in the user wallet.' };
      }

      // Create withdrawal document
      const withdrawal = new WithdrawalModel({
        userId,
        amount,
        bankName,
        accountNumber,
        accountHolderName,
        ifscCode,
        upiId,
      });
      const withdrawalResult = await withdrawal.save();
      if (withdrawalResult) {

        user.wallet -= amount;
        await user.save();

        return { success: true, message: 'Request send Successfully!', data: withdrawalResult };
      } else {
        return { success: false, message: 'Failed to save withdrawal details.' };
      }

    } catch (err) {
      console.log("repository Error")
      console.log(err);
      return { success: false, message: 'Internal server error.' };

    }
  }

  async WithdrawalList() {
    try {

      const list = await WithdrawalModel.find();
      if (list.length > 0) {

        return { success: true, message: "Withdrawal Details retrieved successfully!", data: list };
      } else {
        return { success: false, message: "No Withdrawal Details found." };
      }
    } catch (error) {
      console.log(error);
      return { success: false, message: 'Data Not found' };
    }
  }

  async Withdrawal_Id(withdrawal_id) {
    try {
      const with_id = await WithdrawalModel.findById(withdrawal_id);
      if (with_id) {
        return with_id;
      } else {
        return { success: false, message: "Withdrawal_Id Not found" }
      }
    } catch (error) {
      console.log(error)
      return { success: false, message: "Check Your Withdrawal Id" }
    }
  }
  //--------------------------------------end---------------------------------------//
}
module.exports = UserRepository;