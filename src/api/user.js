 const UserService = require("../services/user-service");
 const UserAuth = require("./middlewares/auth");
 const { UserModel, AddressModel, OPTModel } = require("../database/models");

module.exports = (app) => {
  const service = new UserService();

  app.post("/user/signup", async (req, res, next) => {
    try {
      
      const { email, password, phone } = req.body;
      const { data } = await service.Signup({ email, password, phone });
      return res.json({success:"true",data});
    } catch (err) {
      next(err);
    }
  });

app.post('/user/login',async(req,res,next)=>{
  
try {
  const {email,password,phone} = req.body;
  console.log("login")

  const  data  = await service.SignIn({email,password,phone});
 
  return res.json(data);
} catch (error) {
 
  console.log(error)
  return res.status(500).json({success:false})
}

})

  app.post("/user/address", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;

      const { street, postalCode, city, country } = req.body;

      const { data } = await service.AddNewAddress(_id, {
        street,
        postalCode,
        city,
        country,
      });

      return res.json(data);
    } catch (err) {
      next(err);
    }
  });

  app.get("/user/profile", UserAuth, async (req, res, next) => {
    try {
      const { _id } = req.user;
      const { data } = await service.GetProfile({ _id });
      return res.json(data);
    } catch (error) {
      next(err);
    }
  });

  app.post("/user/forgetpassword", async (req, res, next) => {
    try {

     const {email} =req.body;

     const {data,message } = await service.ForgetPassword(email)
     if (data) {

      return res.status(200).json({ success: true, data, message });

    } else {
      return res.status(404).json({ success: false, message: 'User not found for the given email.'});
    }
    } catch (error) {

      console.log(error)
      return res.status(500).json({success:false})
    }
  });

  app.post("/user/updatepassword", async (req, res, next) => {
    try {
      const {email, OTP, newPassword } = req.body;
        const data = await service.UpdatePassword(email,OTP,newPassword);
     
     res.status(200).json({data})
    
    } catch (error) {

      console.log(error)
      return res.status(500).json({success:false})
    }
  });

  app.post("/user/changepassword",UserAuth, async (req, res, next) => {
    try {
      const user = req.user._id;
      console.log("user",user)
     
      const {curentpassword,newPassword } = req.body;
     
        const data = await service.ChangePassword(user,curentpassword,newPassword);
     
     res.status(200).json({data})
    
    } catch (error) {

      console.log(error)
      return res.status(500).json({success:false})
    }
  });

  app.post('/logout',UserAuth,async (req, res) => {
    const user = req.user
    console.log(user)
    if (user) {
        res.status(200).json({ success: true, message: 'Logout successful' });
    } else {
        res.status(401).json({ success: false, message: 'User not authenticated' });
    }
});
  
};
