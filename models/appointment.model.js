const mongoose = require('mongoose')

const AppointmentSchema = new mongoose.Schema({
    visit: {
        type:String,
        required: true
    },
    cohorts:[
        {
            month:{
                type:String,
                required:true
                }, 
            year: {
                type:String,
                required:true
              }
        }
    ]
});
const Appointment = mongoose.model('appointment',AppointmentSchema);
module.exports = Appointment;
