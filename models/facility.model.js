const mongoose = require('mongoose')

const FacilitySchema = new mongoose.Schema({
    
    name: {
        type:String,
        required: true
    },
    code: {
        type:String,
        required: true
    }
});
const Facility = mongoose.model('Facility',FacilitySchema);
module.exports = Facility;
