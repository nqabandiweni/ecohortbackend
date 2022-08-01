const User = require('../../models/user.model')
const getFacility = require('../../utilities/getFacility')
const jwt = require("jsonwebtoken");
const pick = require("lodash").pick;
const bcrypt = require("bcrypt");
const getRole = require('../../utilities/getRole');
const SECRET = process.env.SECRET
const generator = require('generate-password')

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
                if(obj.unactivatedUserMessage){
                  return 'unactivatedUserError'
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
                if(obj.username && obj.temporaryPassword){
                    return 'successfulRegistration'
                }
            }
        },
        activationResult:{
          __resolveType(obj){
              if(obj.invalidActivationMessage){
                  return 'invalidActivationError'
              }
              if(obj.passwordMismatchMessage){
                  return 'passwordMismatchError'
              }
              if(obj.userNotFoundMessage){
                  return 'userNotFoundError'
              }
              if(obj.alreadyActivatedMessage){
                  return 'alreadyActivatedError'
              }
              if(obj.invalidTemporaryPasswordMessage){
                  return 'invalidTemporaryPasswordError'
              }
              if(obj.successMessage){
                  return 'successfulActivation'
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
            if(user.isNewbie){
              return{unactivatedUserMessage:`${user.username} Should Activate Account First`}
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
            if(args.name == "" || args.surname == "" || args.username =="" ){
              
              return{invalidUserMessage:"Fill in all Fields"}
            }
            const {name,surname,username,code,role} = args
            if(registrar=="admin"){
              const existsInFacility = await User.find({username:username,code:registrarCode})
              if(existsInFacility.length>0){
                return { userExistsMessage:`${args.username} exists at this Facility`}
              }
              if(role=="vendor"){
                return {invalidUserMessage: "Admin cannot register a vendor"}
              }
              var genpassword = generator.generate({
                length: 6,
                numbers: true
              });
              var user = new User({name,surname,username,code:registrarCode,role:"user"});
              user.password = genpassword
              const salt = await bcrypt.genSalt(10);
              //encrypt password
              user.password = await bcrypt.hash(user.password, salt);
              // save the user to the db
              await user.save();
              user.password=genpassword
              return {username:user.username,temporaryPassword:user.password}
            }else if(registrar=="vendor"){
               if(args.code==""||args.role==""){
                  return{invalidUserMessage:"Facility and Role Required!"}
                }
              if(role=="vendor"){
                if(code!="vendor"){
                 
                  return {invalidUserMessage:"Vendor Cannot Belong to a Facility"}
                }else{
                 
                  const vendorExists= await User.find({username:username,code:"vendor"})
                  if(vendorExists.length>0){
                    return { userExistsMessage:`Vendor ${args.username} already exists`}
                  }
                  var genpassword = generator.generate({
                    length: 6,
                    numbers: true
                  });
                  var user = new User({name,surname,username,code,role});
                  user.password = genpassword
                  const salt = await bcrypt.genSalt(10);
                  //encrypt password
                  user.password = await bcrypt.hash(user.password, salt);
                  // save the user to the db
                  await user.save();
                  user.password=genpassword
                  return {username:user.username,temporaryPassword:user.password}
                }
              }else if(role=="admin"){
                if(args.code=="vendor"){
                  return{invalidUserMessage:"Vendor Cannot Belong to a Facility!"}
                }
                const facilityExistence = await User.find({code:code,username:username})
                if(facilityExistence.length>0){
                  return { userExistsMessage:`${args.username} exists at this facility`}
                }
                var genpassword = generator.generate({
                  length: 6,
                  numbers: true
                });
               
                var user = new User({name,surname,username,code,role});
                user.password = genpassword
                  const salt = await bcrypt.genSalt(10);
                  //encrypt password
                  user.password = await bcrypt.hash(user.password, salt);
                  // save the user to the db
                  await user.save();
                  user.password=genpassword
                  return {username:user.username,temporaryPassword:user.password}
              }
            }
          },
          async activate(_,args){
            const {username,temporaryPassword,password,confirmPassword}=args
            if(username==""||temporaryPassword==""||password==""||confirmPassword==""){
              return {invalidActivationMessage:"Enter all Fields!"}
            }
            // check if the user exists
            const user = await User.findOne({ username: username });
            if (!user) {
              return{userNotFoundMessage:`${username} not Found`}
            }
            if(!user.isNewbie){
              return{alreadyActivatedMessage:`${user.username} Already Activated, Login Instead`}
            }
            // check if the password matches the hashed one we already have
            const isValid = await bcrypt.compare(temporaryPassword, user.password);
            if (!isValid) {
              return{invalidTemporaryPasswordMessage:"Incorrect Temporary Password"}
            }
            if(password!==confirmPassword){
              return{passwordMismatchMessage:"Passwords do not Match"}
            }
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password,salt)
            user.isNewbie=false
            await user.save()
            return{successMessage:`${user.username} Can Login Now`}

          }
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