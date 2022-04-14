const jwt = require('jsonwebtoken')

module.exports=function getFacility(token){
    
    if(token){
       
        const parsed = JSON.parse(token)
        //console.log(parsed)
        const code =jwt.verify(parsed,process.env.SECRET,(err)=>{
           
            if(err){
                //console.log(err)
                return null
            }else{
                const decoded = jwt.decode(parsed,process.env.SECRET)
                const facilitycode = decoded.user.code
                return facilitycode
            }
        })
        return code

    }else{
        return null
    }
    
}