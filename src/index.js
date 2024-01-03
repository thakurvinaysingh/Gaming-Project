
const express = require('express');
const {PORT} = require("./config")
const {databaseconnection} = require("./database")
const expressApp = require("./express-app");

const StartServer = async() =>{
   
  
    const app = express();

    await databaseconnection();
    
    await expressApp(app);

      app.listen(PORT,()=>{
        console.log(`listen to port ${PORT}`);

      })
      .on('error',(err)=>{
        console.log(err);
        process.exit();
      })
}

StartServer();