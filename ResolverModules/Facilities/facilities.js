const Facility = require('../../models/facility.model');
const getRole = require('../../utilities/getRole');
module.exports={
    Query:{
        getFacilities:async(_,args,{token})=>{
            if(!token){
                return null
              }
              return await Facility.find()
        }
    },
    createFacilityResult:{
        __resolveType(obj){
            if(obj.facilityExistsMessage){
                return facilityExistsError
            }
            if(obj.invalidFacilityMessage){
                return invalidFacilityError
            }
            if(obj.code && obj.name){
                return Facility
            }
        }
    },
    Mutation:{
        createFacility:async(_,args,{token})=>{
            const {code,name}=args
            const role = getRole(token)
            console.log(role)
            if(code =="" || name==""){
                return{invalidFacilityMessage:"Both Name and Site code required"}
            }
            const facilityExists = await Facility.find({$or: [{code:code},{name:name}]})
            if(facilityExists.length>0){
                return {facilityExistsMessage:`${name} and/or {code} already exists`}
            }
            const facility = new Facility({code,name})
            return await facility.save()
        }
    }
}