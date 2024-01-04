const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    name:String,
    email: String,
    password: String,
    salt: String,
    phone: String,
    address:[
        { type: Schema.Types.ObjectId, ref: 'address' }
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
    wallet: { type: Schema.Types.ObjectId, ref: 'wallet',default: null},
},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
        }
    },
    timestamps: true
});

module.exports =  mongoose.model('user', userSchema);