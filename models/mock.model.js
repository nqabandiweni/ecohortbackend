const mongoose = require('mongoose')

const mockSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    surname:{
        type:String,
        required:true
    }

})

const Mock = new mongoose.model('mock',mockSchema);
module.exports = Mock;