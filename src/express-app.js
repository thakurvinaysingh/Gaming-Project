const express = require("express");
const cors = require("cors");
const {user,bankAccount} = require("./api")
const cookieParser = require('cookie-parser')
// const bodyParser = require('body-parser')
// const HandleError = require("./utils/error-handler")

module.exports =async(app)=>{
    app.use(cookieParser());
    app.use(express.json({limit:'1mb'}));
    app.use(express.urlencoded({extended:true,limit:'1mb'}));
    app.use(cors({
        credentials: true,
        origin: 'http://localhost:3000'
      }));
      
    // app.use(express.static(__dirname + 'src/public/uploads'));
    app.use(express.static('src/public'));
    // app.use(bodyParser.urlencoded({ extended: true }));
    //api handle
    user(app);
    bankAccount(app);

    //error handle
    // app.use(HandleError);
}