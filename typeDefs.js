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
     code:String!
    }
type Facility{
    name:String
    code:String
}
type User{
    name:String
    surname:String
    username:String
    password:String
    code:String
    role:String
}



type AppointmentExistsError {
  AppointmentExistsMessage: String!
}
type AppointmentNotFoundError{
    AppointmentNotFoundMessage: String!
}

type loginSuccess{
    username:String!
    token: String!
}

type userExistsError{
    userExistsMessage:String!
}
type invalidUserError{
    invalidUserMessage:String!
}
type userNotFoundError{
    userNotFoundMessage: String!
}
 type invalidPasswordError{
     invalidPasswordMessage:String!
 }
 type authorisationError{
     authorisationMessage:String!
 }
 
union registrationResult = User | userExistsError | invalidUserError
union loginResult = loginSuccess | userNotFoundError | invalidPasswordError
union createAppointmentResult = Appointment | AppointmentExistsError | authorisationError
union updateAppointmentResult = Appointment | AppointmentNotFoundError | authorisationError
union deleteAppointmentResult = Appointment | AppointmentNotFoundError | authorisationError



type Query{
    hello: String
    getAllAppointments: [Appointment]
    getVisits(cohort:CohortInput!):[String]
}

type Mutation{
    createAppointment(visit:String!,cohorts:[CohortInput!]!):createAppointmentResult
    updateAppointment(visit:String!,cohorts:[CohortInput!]!):updateAppointmentResult
    deleteAppointment(visit:String!):deleteAppointmentResult
    login(username:String!,password:String!):loginResult
    register(name:String!,surname:String!,username:String!,password:String!,code:String!,role:String!):registrationResult
}
`;

module.exports = typeDefs;