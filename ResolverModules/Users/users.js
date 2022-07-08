const User = require('../../models/user.model')
const getFacility = require('../../utilities/getFacility')
const jwt = require("jsonwebtoken");
const pick = require("lodash").pick;
const bcrypt = require("bcrypt");
const getRole = require('../../utilities/getRole');
const SECRET = process.env.SECRET

module.exports={
    resolveTypes:{
        //============Users CRUD UNION RESULTS========================
        loginResult:{
            __resolveType(obj){
              if(obj.invalidDataMessage){
                return 'invalidDataError'
              }
                if(obj.userNotFoundMessage){
                    return 'userNotFoundError'
                }
                if(obj.invalidPasswordMessage){
                    return 'invalidPasswordError'
                }
                if(obj.token){
                    return 'loginSuccess' 
                }
            }
        },
        registrationResult:{
            __resolveType(obj){
                if(obj.userExistsMessage){
                    return 'userExistsError'
                }
                if(obj.invalidUserMessage){
                    return 'invalidUserError'
                }
                if(obj.code){
                    return 'User'
                }
            }
        },
    //============END OF Users CRUD UNION RESULTS====================
    },
    Mutation:{
        //Users MUTATION RESOLVERS==========
        login: async (root, args, context) => {
          if(args.username==""){
            return {invalidDataMessage:'username Required!'}
          }
            // check if the user exists
            const user = await User.findOne({ username: args.username });
            if (!user) {
              return{userNotFoundMessage:`${args.username} not Found`}
            }
            // check if the password matches the hashed one we already have
            const isValid = await bcrypt.compare(args.password, user.password);
            if (!isValid) {
              return{invalidPasswordMessage:"Incorrect Password"}
            }
            //   sign in the user
            // if the user exist then create a token for them
            const token = await jwt.sign(
              {
                user: pick(user, ["_id", "username","role","code"])
              },
              SECRET,
              // this token will last for a day, but you can change it
              // check the jsonwebtoken for more on this
              { expiresIn: "1d" }
            );
         
            return {
                    token:token,
                    username:user.username
            
            };
          },
          async register(_,args,{token}) {
            
            const registrar = getRole(token)
            const registrarCode = getFacility(token)
            if(args.name == "" || args.surname == "" || args.username =="" || args.password==""||args.code==""||args.role==""){
              
              return{invalidUserMessage:"Fill in all Fields"}
            }
            const {name,surname,username,code,role} = args
          
            var pass = args.password
            if(registrar=="admin"){
              const existsInFacility = await User.find({username:username,code:registrarCode})
              if(existsInFacility.length>0){
                return { userExistsMessage:`${args.username} exists at this Facility`}
              }
              if(role=="vendor"){
                return {invalidUserMessage: "Admin cannot register a vendor"}
              }
              password = await bcrypt.hash(pass, 12);
              const user = new User({name,surname,username,password,code:registrarCode,role});
              // save the user to the db
              return  await user.save();
            }else if(registrar=="vendor"){
              
              if(role=="vendor"){
                if(code!="vendor"){
                 
                  return {invalidUserMessage:"Vendor Cannot Belong to a Facility"}
                }else{
                 
                  const vendorExists= await User.find({username:username,code:"vendor"})
                  if(vendorExists.length>0){
                    return { userExistsMessage:`Vendor ${args.username} already exists`}
                  }
                  password = await bcrypt.hash(pass, 12);
                  const user = new User({name,surname,username,password,code,role});
                  // save the user to the db
                  return  await user.save();
                }
              }else if(role=="admin"){
               
                const facilityExistence = await User.find({code:code,username:username})
                console.log(facilityExistence)
                if(facilityExistence.length>0){
                  return { userExistsMessage:`${args.username} exists at this facility`}
                }
                password = await bcrypt.hash(pass, 12);
                const user = new User({name,surname,username,password,code,role});
                // save the user to the db
                return  await user.save();
              }
            }
          },
          //End of Users MUTATION RESOLVERS==========

    },
    Query:{
      getUsers: async(_,args,{token})=>{
        if(!token){
          return null
        }
        const facilityCode = getFacility(token)
        const role = getRole(token)
        if(role=="admin"){
        
          return await User.find({code:facilityCode})
        }else if(role=="vendor"){
          return await User.find({role:"admin"})
        }else{
          return null
        }
      }


    }
}