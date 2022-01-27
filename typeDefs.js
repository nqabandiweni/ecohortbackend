const {gql} = require('apollo-server-express')

const typeDefs = gql`
 type Appointment{
     id:ID
     visit: String
     cohorts:[]
        
    }
type Query{
    hello: String
    getAllAppointments: [Appointment]
   
}`;

module.exports = typeDefs;