const Appointment = require('./models/appointment.model')
const resolvers = {
    Query: {
        hello:()=>{
            return "Hello World"
        },
        getAllAppointments:async ()=>{
            
            return  await Appointment.find();

        }
    },
    Mutation:{
        createAppointment: async (parent,args,context,info)=>{
            console.log(args)
            const {visit,cohorts}=args;
            const appointment = new Appointment({visit,cohorts});
            await appointment.save();
            return appointment;
        },
    }
};

module.exports = resolvers;