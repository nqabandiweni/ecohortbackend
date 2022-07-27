const jwt = require('jsonwebtoken')

module.exports = function getRole(token){
    
    if(token){
        const parsed = JSON.parse(token)
        const role = jwt.verify(parsed,process.env.SECRET,(err)=>{
           
            if(err){
   
                return null
            }else{
                const decoded = jwt.decode(parsed,process.env.SECRET)
                const role = decoded.user.role
                
                return role
            }
        })
        return role

    }else{
        return null
    }
    
}