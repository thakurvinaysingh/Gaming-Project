const mongoose = require("mongoose");
const {DB_URL} = require("../config");


module.exports = async () => {
  try {
    await mongoose.connect(DB_URL); 
    console.log("Database connection successful");
  } catch (error) {
    console.error("Error connecting to database:", error); 
    process.exit(1);
  }
};

// module.exports = async()=>{
//     try {
//         await mongoose.connect(DB_URL,{
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         });
//         console.log("Database connection successful");
//     } catch (error) {
//         console.log("Error-----");
//         console.log(error);
//         process.exit(1);
//     }
// }