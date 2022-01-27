const {gql} = require('apollo-server-express')

const typeDefs = gql`
input CohortInput{
    month:String
    year: Int
}
 type Appointment{
     id:ID
     visit: String
     cohorts:[Cohort!]
    }
type Cohort{
    month:String
    year:Int 
}
type Query{
    hello: String
    getAllAppointments: [Appointment]
    
   
}

type Mutation{
    createAppointment(visit:String!,cohorts:[CohortInput!]!):Appointment
}
`;

module.exports = typeDefs;