const express = require("express");
const cors = require("cors");
const {user} = require("./api")
const cookieParser = require('cookie-parser')
const HandleError = require("./utils/error-handler")

module.exports =async(app)=>{
    app.use(cookieParser());
    app.use(express.json({limit:'1mb'}));
    app.use(express.urlencoded({extended:true,limit:'1mb'}));
    app.use(cors({
        credentials: 'true',
        origin: 'http://localhost:3000'
      }));
      
    app.use(express.static(__dirname + '/public'));

    //api handle
    user(app);


    //error handle
    app.use(HandleError);
}