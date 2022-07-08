const Facility = require('../../models/facility.model')

module.exports={
    Query:{
        getFacilities:async(_,args,{token})=>{
            if(!token){
                return null
              }
              return await Facility.find()
        }
    }
}