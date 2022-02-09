const {gql, UserInputError} = require('apollo-server-express')

const typeDefs = gql`
input CohortInput{
    month:String
    year: Int
}
type Cohort{
    _id:ID
    month:String
    year:Int 
}
 type Appointment{
     _id:ID
     visit: String
     cohorts:[Cohort]
    }
type Mock{
    _id:ID
    name:String
    surname:String
}


type AppointmentExistsError {
  message: String!
}
type MockExistsError{
    message: String
}
type CohortBookedError{
    booked: String
}

union createAppointmentResult = Appointment | AppointmentExistsError

type Query{
    hello: String
    getAllAppointments: [Appointment]
    getAllMocks:[Mock]
    
   
}

type Mutation{
    createAppointment(visit:String!,cohorts:[CohortInput!]!):createAppointmentResult
    createMock(name:String!,surname:String!):Mock
}
`;

module.exports = typeDefs;