const Appointment = require('../../models/appointment.model')
const getFacility = require('../../utilities/getFacility')
const getRole = require('../../utilities/getRole')

module.exports={
    resolveTypes:{
        //============Appointments CRUD UNION RESULTS====================
      createAppointmentResult: {
        __resolveType(obj, info){
          if(obj.authorisationMessage){
            return 'authorisationError';
          }
          // Only AppointmentExistsError has a AppointmentExistsMessage field
          if(obj.AppointmentExistsMessage){
            return 'AppointmentExistsError';
          }
        
          // Only Appointment has visit
          if(obj.visit){
            return 'Appointment';
          }
          return null; // GraphQLError is thrown
        }
      },
     
      updateAppointmentResult: {
        __resolveType(obj,  info){
          if(obj.authorisationMessage){
            return 'authorisationError';
          }
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
        __resolveType(obj, info){
          if(obj.authorisationMessage){
            return 'authorisationError';
          }
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
      //============ END OF Appointments CRUD UNION RESULTS===============

    },
    Query:{
        //APPOINTMENTS QUERY RESOLVERS==========
        getAllAppointments:async (_,args,{token})=>{
            if(!token){
              return null
            }
            const facility = getFacility(token);
            return  await Appointment.find({code:facility});
        },
        getVisits: async(_,args,{token})=>{ 
          const {cohort}= args
          const facility = getFacility(token);
          const all = await Appointment.find({code:facility})
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
        
        async createAppointment (_,args,{token}){
            if(!token){
              return{authorisationMessage:"Login First!"}
            }
            const code= getFacility(token)
            const {visit,cohorts} = args
            const visitFound = await Appointment.find({visit:visit,code:code})
        
            if(visitFound.length>0){
              return {AppointmentExistsMessage: `${args.visit} Already exists`}
                
            } 
            else{
                  const appointment = new Appointment({visit,cohorts,code});
                  return  await appointment.save();
                }
          },
          async updateAppointment(_,args,{token}){
            if(!token){
              return{authorisationMessage:"Login First!"}
            }
            const code = getFacility(token)
            const filter = {visit:args.visit,code:code}
            const update ={visit:args.visit,cohorts:args.cohorts}
            
            const there = await Appointment.find({visit:args.visit})
          
            if(there.length>0){
              return await Appointment.findOneAndUpdate(filter, update, {new: true})

            }else{
              return {AppointmentNotFoundMessage: `${args.visit} Not Found`}
            }
          },
          async deleteAppointment(_,args,{token}){
            if(!token){
              return{authorisationMessage:"Login First!"}
            }
            const code = getFacility(token)
            const filter = {visit:args.visit,code:code}
            const there = await Appointment.find({visit:args.visit,code:code})
          
            if(there.length>0){
              return await Appointment.findOneAndDelete(filter)

            }else{ 
               return {AppointmentNotFoundMessage: `${args.visit} Not Found`}
            }

          }
        
          //===END OF APPOINTMENTS MUTATION RESOLVERS==========
        
        

    }
}