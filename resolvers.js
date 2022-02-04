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
            const {visit,cohorts}=args;
            const visitFound = await Appointment.find({visit:visit})
            console.log(visitFound.length)
            if(visitFound.length>0){
                return{
                    __typename: "AppointmentExistsError",
                    message: `${args.visit} Already exists`
                }
            }
            const appointment = new Appointment({visit,cohorts});
            await appointment.save();
            console.log(appointment)
            return  {
                __typename: "Appointment",
                 appointment:appointment
            }
            
        },
    }
};

module.exports = resolvers;