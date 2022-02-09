const {UserInputError} = require('apollo-server-express');
const Appointment = require('./models/appointment.model')
const Mock = require('./models/mock.model')
const resolvers = {
    createAppointmentResult: {
        __resolveType(obj, context, info){
          // Only ppointmentExistsError has a message field
          if(obj.message){
            return 'AppointmentExistsError';
          }
        //   if(obj.booked){
        //     return 'CohortBookedError';
        //   }
          // Only Appointment has visit
          if(obj.visit){
            return 'Appointment';
          }
          return null; // GraphQLError is thrown
        },
      },
    Query: {
        hello:()=>{
            return "Hello World"
        },
        getAllAppointments:async ()=>{
            
            return  await Appointment.find();
        },
        getAllMocks:async ()=>{
            
            return  await Mock.find();
        }
    },
    Mutation:{
        async createMock(_,args){
            const {name,surname} = args    
            const foundMock = await Mock.find({name:name})
            if(foundMock.length>0){
                throw new UserInputError(`${name} exists`)
            }            
                
            const mock = new Mock({name,surname})
            const newMock = await mock.save()
                
           
            return  newMock
        },
         async createAppointment (_,args){
            const {visit,cohorts} = args
            const visitFound = await Appointment.find({visit:visit})
            const cohortFound ={}
            const all = await Appointment.find()
            // for(var i=0;i<=all.length;i++){
            //     for(var j=0;j<=all[i].cohorts.length;j++){
            //         console.log(all[i].cohorts[j].month)
            //        for(var c=0;c<=cohorts.length;c++){
            //            if(all[i].cohorts[j].month==cohorts[c].month && all[i].cohorts[j].month==cohorts[c].year){
            //                 cohortFound.visit=all[i].visit
            //                 cohortFound.cohort=cohorts[j]
            //            }
            //        }
            //     }
            // }
            if(visitFound.length>0){
                return {message: `${args.visit} Already exists`}
                
            } 
            // else if(cohortFound){
            //     return {booked:`${cohortFound.visit} already has ${cohortFound.cohort.month} ${cohortFound.cohort.year} `}
            // }
            else{
                    const appointment = new Appointment({visit,cohorts});
                    return  await appointment.save();
                    }
            }
        
        },
    }


module.exports = resolvers;