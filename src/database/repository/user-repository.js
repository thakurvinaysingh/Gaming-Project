//Dealing with data base opertion
const { UserModel, AddressModel, OPTModel } = require("../models");
const { GeneratePassword, GenerateSalt } = require("../../utils");
const { APIError, BadRequestError, STATUS_CODES } = require("../../utils/app-errors");
const bcrypt = require('bcrypt');

class UserRepository {
  async UserCreate({ name, email, password, phone, salt }) {
    try {
      const user = new UserModel({
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
        return { success: false, message:'User Not found.' };
      }
    
      const existingUser = await UserModel.findOne(query);
      if (existingUser) {
       
        return existingUser;
      }else{
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
      console.log("email", user)
      if (user) {
        const salt = await GenerateSalt();

        const hashedPassword = await GeneratePassword(newPassword, salt);
        user.password = hashedPassword;
        user.salt = salt;
        await user.save();
        console.log("Password updated successfully");
        return { success: true, message: 'Password updated successfully.' };
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


}


module.exports = UserRepository;