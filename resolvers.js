const {UserInputError} = require('apollo-server-express');
const Appointment = require('./models/appointment.model')
const Mock = require('./models/mock.model')
const resolvers = {
  //============Appointments CRUD UNION RESULTS====================
    createAppointmentResult: {
        __resolveType(obj, context, info){
          // Only AppointmentExistsError has a AppointmentExistsMessage field
          if(obj.AppointmentExistsMessage){
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
        }
      },
      updateAppointmentResult: {
        __resolveType(obj, context, info){
          // Only AppointmentNotFoundError an AppointmentNotFoundMessage field
          if(obj.AppointmentNotFoundMessage){
            return 'AppointmentNotFoundError';
          }
          if(obj.visit){
            return 'Appointment';
          }
          return null; // GraphQLError is thrown
        }
      },
      deleteAppointmentResult: {
        __resolveType(obj, context, info){
          // Only AppointmentNotFoundError an AppointmentNotFoundMessage field
          if(obj.AppointmentNotFoundMessage){
            return 'AppointmentNotFoundError';
          }
          if(obj.visit){
            return 'Appointment';
          }
          return null; // GraphQLError is thrown
        }
      },
      //============ END OF Appointments CRUD UNION RESULTS====================
    Query: {
      //APPOINTMENTS QUERY RESOLVERS==========
        getAllAppointments:async ()=>{
           
            return  await Appointment.find();
        },
        getAllMocks:async ()=>{
            
            return  await Mock.find();
        },
        getVisits: async(_,args)=>{
          const {cohort}= args
          
          const all = await Appointment.find()
          var visit = []
         all.forEach(function(a) {
            a.cohorts.forEach(function(c){
              if(c.month == cohort.month && c.year == cohort.year){
                 visit.push(a.visit)
              }
            })
        });
        return visit
        }
          // ====END OF APPOINTMENTS QUERY RESOLVERS==========
    },
    Mutation:{
        //APPOINTMENTS MUTATION RESOLVERS==========
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
        
            if(visitFound.length>0){
              return {AppointmentExistsMessage: `${args.visit} Already exists`}
                
            } 
            else{
                  const appointment = new Appointment({visit,cohorts});
                  return  await appointment.save();
                }
          },
          async updateAppointment(_,args){
            const filter = {visit:args.visit}
            const update ={visit:args.visit,cohorts:args.cohorts}
            
            const there = await Appointment.find({visit:args.visit})
          
            if(there.length>0){
              return await Appointment.findOneAndUpdate(filter, update, {new: true})

            }else{
              return {AppointmentNotFoundMessage: `${args.visit} Not Found`}
            }
          },
          async deleteAppointment(_,args){
            const filter = {visit:args.visit}
            const there = await Appointment.find({visit:args.visit})
          
            if(there.length>0){
              return await Appointment.findOneAndDelete(filter)

            }else{              return {AppointmentNotFoundMessage: `${args.visit} Not Found`}
            }

          }
          //===END OF APPOINTMENTS MUTATION RESOLVERS==========
        
        },
    }


module.exports = resolvers;