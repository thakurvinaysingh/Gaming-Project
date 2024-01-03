//Dealing with data base opertion
const { UserModel, AddressModel, OPTModel } = require("../models");
const { GeneratePassword,GenerateSalt} = require("../../utils");
const { APIError, BadRequestError, STATUS_CODES } = require("../../utils/app-errors");

class UserRepository {
  async UserCreate({ email, password, phone, salt }) {
    try {
      const user = new UserModel({
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
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to create User"
      );

    }
  }
  async FindEmail({email}){
    try {
      const existingUser =  await UserModel.findOne({email:email});
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
        console.log("error");
        return { success: false, message: 'Internal server error.' };
      }

      const existingUser = await UserModel.findOne(query);

      return existingUser;
    } catch (error) {
      console.error(error);
      return { success: false, message: 'Internal server error.' };
    }
  }


  async CreateAddress({ _id, street, postalCode, city, country }) {
    console.log("son")

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
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Error on Create Address"
      );
    }
  }

  async FindCustomerById({ id }) {
    try {
      const existingCustomer = await UserModel.findById(id)
        .populate("address");


      return existingCustomer;
    } catch (err) {
      throw new APIError(
        "API Error",
        STATUS_CODES.INTERNAL_ERROR,
        "Unable to Find Customer"
      );
    }
  }

  async StoreOPT({ OTP, email, expirationDate }) {
    console.log(OTP, email, expirationDate)
    try {
      console.log("pass1")
      const existingEmail = await UserModel.findOne({ email })
      // check the existing opt and deleted
      await OPTModel.findOneAndDelete({ email });

      if (existingEmail) {
        console.log("pass1")
        const newOPT = new OPTModel({
          OTP,
          email: existingEmail.email,
          expirationDate,
        });

        const data = await newOPT.save();
        return data;
      } else {
         console.log("email is not found")
         return null; 
      }
    } catch (err) {
      console.log(err)
      return null; 
    }
  }

  async checkOPT(email) {
    try {
        const existingOPT = await OPTModel.findOne({ email});
      
        if (existingOPT) {
          // Check if the expiration date is valid
          const expirationDate = existingOPT.expirationDate;
         const OTP = existingOPT.OTP;
         return { success: true, data: { OTP, expirationDate } };
      } else {
          return { success: false, message: 'OPT not found.' };
      }
    } catch (error) {
        console.error(error);
        return { success: false, message: 'Internal server error.' };
    }
}

async ChangePassword(email, newPassword) {
  try {
    console.log("email",email)
      const user = await this.FindEmail({email});
      console.log("email",user)
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


}


module.exports = UserRepository;