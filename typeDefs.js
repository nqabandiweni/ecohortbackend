const {gql} = require('apollo-server-express')

const typeDefs = gql`
input CohortInput{
    month:String
    year: Int
}
 type Appointment{
     id:ID
     visit: String!
     cohorts:[Cohort!]!
    }
type Cohort{
    month:String
    year:Int 
}
type AppointmentExistsError {
  message: String!
}

union createAppointmentResult = Appointment | AppointmentExistsError
type Query{
    hello: String
    getAllAppointments: [Appointment]
    
   
}

type Mutation{
    createAppointment(visit:String!,cohorts:[CohortInput!]!):createAppointmentResult
}
`;

module.exports = typeDefs;