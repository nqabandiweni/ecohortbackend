const mongoose = require('mongoose')

const UserSchema = new mongoose.Schema({
    
    name: {
        type:String,
        required: true
    },
    surname:{
        type:String,
        required:true
    },
    email: {
        type: String,
        required: true
    },
    password:{
        type:String,
        required:true
    },
    code: {
        type:String,
        required: true
    },
    role:{
        type:String,
        required:true
    },
    isNewbie:{
        type:Boolean,
        default:true
    }
});
const User = mongoose.model('User',UserSchema);
module.exports = User;
