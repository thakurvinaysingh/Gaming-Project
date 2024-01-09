const UserService = require("../services/user-service");
const UserAuth = require("./middlewares/auth");
const { UserModel, AddressModel, OPTModel } = require("../database/models");

module.exports = (app) => {
  const service = new UserService();

  app.post("/signup", async (req, res, next) => {
    try {

      const { name, email, password, phone } = req.body;
      if (!email || !password || !phone) {
        return res.status(400).json({ success: false, message: "Please provide valid email, password, and phone" });
      }
      const data = await service.Signup({ name, email, password, phone });
      if (data) {
        return res.json(data);
      } else {
        return res.status(300).json({ success: false, message: "Data  not found" })
      }
    } catch (err) {
      console.log(err)
      return res.status(400).json({ success: false, message: "check Your Credentials" })
    }
  });

  app.post('/login', async (req, res, next) => {

    try {
      const { email, password,phone} = req.body;

      // Check if any of the required fields is missing or empty
      if (!(email || phone) || !password) {
        return res.status(400).json({ success: false, message: "Please provide either a valid email or phone, and a password" });
    }

      const data = await service.SignIn({ email, password, phone },res);
      if (data) {
        return res.json(data);
      } else {
        return res.status(400).json({ success: false, message: "Data  not found" })
      }

    } catch (error) {

      console.log(error)
      return res.status(400).json({ success: false, message: "check Your Credentials" })
    }

  })

  app.post("/user/address", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;

      const { street, postalCode, city, country } = req.body;
      if (!street || !postalCode || !city || !country) {
        return res.status(400).json({ success: false, message: "Please provide valid street, postalCode,city and country" });
      }
      const data = await service.AddNewAddress(_id, {
        street,
        postalCode,
        city,
        country,
      });

      return res.json(data);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false ,message:"Internal error"})
    }
  });

  app.get("/user/profile", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const data = await service.GetProfile({ _id });
      return res.json(data);
    } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false ,message:"Internal error"})
    }
  });

  app.post("/user/forgetpassword", async (req, res, next) => {
    try {

      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ success: false, message: "Please provide valid Email" });
      }
      const data = await service.ForgetPassword(email)
      if (data) {

        return res.status(200).json(data);

      } else {
        return res.status(404).json({ success: false, message: 'User not found for the given email.' });
      }
    } catch (error) {

      console.error(error);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
  });

  app.post("/user/updatepassword", async (req, res, next) => {
    try {
      const { email, OTP, newPassword } = req.body;
      if (!email || !OTP || !newPassword ) {
        return res.status(400).json({ success: false, message: "Please provide valid Email, OTP and Password" });
      }
      const data = await service.UpdatePassword(email, OTP, newPassword);

      res.status(200).json(data)

    } catch (error) {

      console.log(error)
      return res.status(500).json({ success: false })
    }
  });

  app.post("/user/changepassword", UserAuth, async (req, res, next) => {
    try {
      const user = req.user._id;
      console.log("user", user)

      const { curentpassword, newPassword } = req.body;

      const data = await service.ChangePassword(user, curentpassword, newPassword);

      res.status(200).json(data)

    } catch (error) {

      console.log(error)
      return res.status(500).json({ success: false })
    }
  });

  app.post('/logout', UserAuth, async (req, res) => {
    const user = req.user
    console.log(user)
    if (user) {
      res.status(200).json({ success: true, message: 'Logout successfully' });
    } else {
      res.status(401).json({ success: false, message: 'User not authenticated' });
    }
  });

  //-------------------------------User CRUD Operation------------------------------------//

  app.post('/status/:id', async (req, res) => {
   try {
    const Id = req.params.id;
    const data = await service.updateStatus(Id)
    if(data){
       return res.status(200).json(data)
    }else{
      return res.status(300).json({success:false,message:"Status Not Update!"})
    }
    
   } catch (error) {
      console.log(error)
      return res.status(500).json({ success: false })
   }
  });

};
