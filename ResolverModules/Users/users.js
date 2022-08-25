const User = require('../../models/user.model')
const getFacility = require('../../utilities/getFacility')
const jwt = require("jsonwebtoken");
const pick = require("lodash").pick;
const bcrypt = require("bcrypt");
const getRole = require('../../utilities/getRole');
const SECRET = process.env.SECRET
const generator = require('generate-password')
var validator = require('validator');

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
                if(obj.email && obj.temporaryPassword){
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
      deleteUserResult: {
        __resolveType(obj){
          if(obj.authorisationMessage){
            return 'authorisationError';
          }
          // Only UserNotFoundError an UserNotFoundMessage field
          if(obj.userNotFoundMessage){
            return 'userNotFoundError';
          }
          if(obj.email){
            return 'User';
          }
          return null; // GraphQLError is thrown
        }
      },
      resetPasswordResult:{
        __resolveType(obj){
          if(obj.userNotFoundMessage){
            return 'userNotFoundError'
          }
          if(obj.email && obj.temporaryPassword){
            return 'successfulPasswordReset'
          }
          return null; // GraphQLError is thrown
        }
      }
      
    //============END OF Users CRUD UNION RESULTS====================
    },
    Mutation:{
        //Users MUTATION RESOLVERS==========

        //=======LOGIN==============================
        login: async (root, args, context) => {
      
          if(args.email==""){
            return {invalidDataMessage:'email Required!'}
          }
          if(!validator.isEmail(args.email)){
            return{invalidDataMessage:"Invalid Email Address"}

          }
            // check if the user exists
            const user = await User.findOne({ email: args.email });
            
            if (!user) {
              return{userNotFoundMessage:`${args.email} not Found`}
            }
            
            if(user.isNewbie==true){
              return{unactivatedUserMessage:`${user.email} Should Activate Account First`}
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
                user: pick(user, ["_id","name", "email","role","code"])
              },
              SECRET,
              // this token will last for a day, but you can change it
              // check the jsonwebtoken for more on this
              { expiresIn: "1d" }
            );
         
            return {
                    token:token
            };
          },
          //=======END OF LOGIN==============================

          //=======REGISTER==============================
          async register(_,args,{token}) {
            
            const registrar = getRole(token)
            const registrarCode = getFacility(token)
            if(args.name == "" || args.surname == "" || args.email =="" ){
              
              return{invalidUserMessage:"Fill in all Fields"}
            }
            const {name,surname,email,code,role} = args
            if(!validator.isEmail(email)){
              return{invalidUserMessage:"Invalid Email Address"}

            }
            if(registrar=="admin"){
              const existsInFacility = await User.find({email:email})
              if(existsInFacility.length>0){
                return { userExistsMessage:`${args.email} exists`}
              }
              if(role=="vendor"){
                return {invalidUserMessage: "Admin cannot register a vendor"}
              }
              var genpassword = generator.generate({
                length: 6,
                numbers: true
              });
              var user = new User({name,surname,email,code:registrarCode,role:"user"});
              user.password = genpassword
              const salt = await bcrypt.genSalt(10);
              //encrypt password
              user.password = await bcrypt.hash(user.password, salt);
              // save the user to the db
              await user.save();
              user.password=genpassword
              return {email:user.email,temporaryPassword:user.password}
            }else if(registrar=="vendor"){
               if(args.code==""||args.role==""){
                  return{invalidUserMessage:"Facility and Role Required!"}
                }
              if(role=="vendor"){
                if(code!="vendor"){
                 
                  return {invalidUserMessage:"Vendor Cannot Belong to a Facility"}
                }else{
                 
                  const vendorExists= await User.find({email:email,code:"vendor"})
                  if(vendorExists.length>0){
                    return { userExistsMessage:`Vendor ${args.email} already exists`}
                  }
                  var genpassword = generator.generate({
                    length: 6,
                    numbers: true
                  });
                  var user = new User({name,surname,email,code,role});
                  user.password = genpassword
                  const salt = await bcrypt.genSalt(10);
                  //encrypt password
                  user.password = await bcrypt.hash(user.password, salt);
                  // save the user to the db
                  await user.save();
                  user.password=genpassword
                  return {email:user.email,temporaryPassword:user.password}
                }
              }else if(role=="admin"){
                if(args.code=="vendor"){
                  return{invalidUserMessage:"Vendor Cannot Belong to a Facility!"}
                }
                const facilityExistence = await User.find({email:email})
                if(facilityExistence.length>0){
                  return { userExistsMessage:`${args.email} exists`}
                }
                var genpassword = generator.generate({
                  length: 6,
                  numbers: true
                });
               
                var user = new User({name,surname,email,code,role});
                user.password = genpassword
                  const salt = await bcrypt.genSalt(10);
                  //encrypt password
                  user.password = await bcrypt.hash(user.password, salt);
                  // save the user to the db
                  await user.save();
                  user.password=genpassword
                  return {email:user.email,temporaryPassword:user.password}
              }
            }
          },
          //=======END OF REGISTER==============================

          //=======ACTIVATE==============================
          async activate(_,args){
          
            const {email,temporaryPassword,password,confirmPassword}=args
            if(email==""||temporaryPassword==""||password==""||confirmPassword==""){
              return {invalidActivationMessage:"Enter all Fields!"}
            }
            
            // check if the user exists
            const user = await User.findOne({ email: email });
            if (!user) {
              return{userNotFoundMessage:`${email} not Found`}
            }
            if(!user.isNewbie){
              return{alreadyActivatedMessage:`${user.email} Already Activated, Login Instead`}
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
            return{successMessage:`${user.email} Can Login Now`}

          },
          //=======END OF ACTIVATE==============================
          //=======DELETE==============================
          async deleteUser(_,args,{token}){
            if(!token){
              return{authorisationMessage:"Login First!"}
            }
            
            const registrar = getRole(token)
            const filter = {email:args.email}
            const there = await User.find(filter)
            if(there.length>0){
              const role = there[0].role
             
              if(role=="vendor" && registrar=="admin"){
                return{authorisationMessage:"Admin Cannot Delete Vendor"}
              }
               
              return  await User.findOneAndDelete(filter)
          
            }else{ 
               return {userNotFoundMessage: `${args.email} Not Found`}
            }

          },
          //======= END OF DELETE==============================

          //=======PASSWORD RESET==============================
          async resetPassword (_,args,{token}){
            const {email} = args
            // check if the user exists
            const user = await User.findOne({ email: email });
            if (!user) {
              return{userNotFoundMessage:`${args.email} not Found`}
            }
            user.isNewbie=true
            var temporaryPassword = generator.generate({
              length: 6,
              numbers: true
            });
            const salt = await bcrypt.genSalt(10);
            //encrypt password
            user.password = await bcrypt.hash(temporaryPassword, salt);
            await user.save()
            return{email:email,temporaryPassword:temporaryPassword}
          }
          
          //=======END OF PASSWORD RESET==============================

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
          
          return await User.find({role:{$in:["vendor","admin"]}})
        }else{
          return null
        }
      }


    }
}

