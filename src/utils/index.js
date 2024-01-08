const bcrypt = require("bcrypt");
 const jwt = require("jsonwebtoken");
const { APP_SECRET } = require("../config");
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const multer = require('multer');
 // utility functions

 // all images handler here uplodas.

 const FILE_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/jpg': 'jpg'
}
 const storage = multer.diskStorage({
  destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype];
      let uploadError = new Error('invalid image type');

      if (isValid) {
          uploadError = null
      }
      cb(uploadError, 'src/public/uploads')
  },
  filename: function (req, file, cb) {

      const fileName = file.originalname.split(' ').join('-');
      const extension = FILE_TYPE_MAP[file.mimetype];
      cb(null, `${fileName}-${Date.now()}.${extension}`)
  }
})

module.exports.uploadOptions = multer({ storage: storage })


module.exports.GenerateSalt = async () =>{
    return await bcrypt.genSalt();
}

module.exports.GenerateOTP = async () => {
  const min = 100000; // Minimum 6-digit number
  const max = 999999; // Maximum 6-digit number
  const otp = Math.floor(Math.random() * (max - min + 1)) + min;
  return otp.toString();
};


 module.exports.GeneratePassword = async(password,salt) =>{
 return await bcrypt.hash(password,salt);
 };

 module.exports.GenerateSignature = async(payload,res)=>{
    try {
       const token = await jwt.sign(payload,APP_SECRET,{expiresIn:"30d"}); 

      // Set the token as a cookie
        res.cookie('jwt', token, {
            httpOnly: true,
            maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        });

        return token;
    } catch (error) {
        console.log(error);
        return error;
    }
 }

 module.exports.FormateData =(data)=>{
    if(data){
        return{data};
    }else{
        throw new Error("Data Not Found");
    }
 }

 module.exports.ValidateSignature = async (req) => {
    try {
      // const signature = req.get("Authorization");
      // console.log(signature);
      // const payload = await jwt.verify(signature.split(" ")[1], APP_SECRET);
      // req.user = payload;
      // return true;
      let signature;

        if (req.headers.authorization) {
            signature = req.headers.authorization.split(" ")[1];
        }
        if (!signature && req.cookies.jwt) {
            signature = req.cookies.jwt;
        }

        if (!signature) {
            console.log('Token not found in headers or cookies');
            return false;
        }
        const payload = await jwt.verify(signature, APP_SECRET);
        req.user = payload;
        return true;
        
    } catch (error) {
      console.log(error);
      return false;
    }
  };

  module.exports.ValidatePassword = async (
    enteredPassword,
    savedPassword,
    salt
  ) => {
    return (await this.GeneratePassword(enteredPassword, salt)) === savedPassword;
  };

 

  module.exports.sendEmail = async (to, subject, html) => {
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: 'vinay.singh5497@gmail.com',
            pass: 'bcackyyamyacslqa'
        }
    });

    const message = {
        from: "vinay.singh5497@gmail.com",
        to,
        subject,
        html,
    };

    //return transporter.sendMail(message);
    return new Promise((resolve, reject) => {
      transporter.sendMail(message, (error, info) => {
        if (error) {
          console.log('Error sending email:', error);
          reject(error);
        } else {
          console.log('Email sent:', info.response);
          resolve(info);
        }
      });
    });
};