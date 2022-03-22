const {gql, UserInputError} = require('apollo-server-express')

const typeDefs = gql`
input CohortInput{
    month:String
    year: Int
}
type Cohort{
    month:String
    year:Int 
}
 type Appointment{
    _id: ID
     visit: String
     cohorts:[Cohort]
    }
type Mock{
    _id:ID
    name:String
    surname:String
}


type AppointmentExistsError {
  AppointmentExistsMessage: String!
}
type AppointmentNotFoundError{
    AppointmentNotFoundMessage: String!
}
type MockExistsError{
    message: String
}
type CohortBookedError{
    booked: String
}

union createAppointmentResult = Appointment | AppointmentExistsError
union updateAppointmentResult = Appointment | AppointmentNotFoundError
union deleteAppointmentResult = Appointment | AppointmentNotFoundError


type Query{
    hello: String
    getAllAppointments: [Appointment]
    getAllMocks:[Mock]
    getVisits(cohort:CohortInput!):[String]
}

type Mutation{
    createAppointment(visit:String!,cohorts:[CohortInput!]!):createAppointmentResult
    createMock(name:String!,surname:String!):Mock
    updateAppointment(visit:String!,cohorts:[CohortInput!]!):updateAppointmentResult
    deleteAppointment(visit:String!):deleteAppointmentResult
}
`;

module.exports = typeDefs;