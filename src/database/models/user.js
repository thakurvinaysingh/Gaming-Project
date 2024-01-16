const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    userId: { type: Number, required: true, unique: true },
    name:String,
    email: String,
    password: String,
    salt: String,
    phone: String,
    address:[
        { type: Schema.Types.ObjectId, 
            ref: 'address'
         }
    ],
    image: {
        type: String,
        default: ''
    },
    role:{
        type:String,
        enum:["super-admin","admin","user"],
        default:"user"
    },
    wallet: {
        type: Number,
        default: 0
      },
    lastrecharge:{
        type:String
    },
    s_promocode:{
        type:String,
        default:"Not Found"
    },
    promocode:{
        type:String,
        default:"Not Found"
    },
    comment:{
        type:String,
        default:"Not Found!"
    },
    status:{
        type:Boolean,
        default:true
    }

},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
        }
    },
    timestamps: true
}
);



module.exports =  mongoose.model('user', userSchema);