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
    name:String!
    code:String!
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
type unactivatedUserError{
    unactivatedUserMessage:String!
}

type userExistsError{
    userExistsMessage:String!
}
type invalidUserError{
    invalidUserMessage:String!
}
type invalidDataError{
    invalidDataMessage:String!
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
 type facilityExistsError{
    facilityExistsMessage:String!
 }
 type invalidFacilityError{
    invalidFacilityMessage: String!
 }
 type successfulRegistration{
    username:String!
    temporaryPassword:String!
 }
 type successfulActivation{
    successMessage:String!
 }
 type passwordMismatchError{
    passwordMismatchMessage:String!
 }
 type alreadyActivatedError{
    alreadyActivatedMessage:String!
 }
 type invalidTemporaryPasswordError{
    invalidTemporaryPasswordMessage:String!
 }
 type invalidActivationError{
    invalidActivationMessage:String!
 }
 
union registrationResult = successfulRegistration | userExistsError | invalidUserError
union loginResult = loginSuccess | userNotFoundError | invalidPasswordError | invalidDataError |unactivatedUserError
union createAppointmentResult = Appointment | AppointmentExistsError | authorisationError
union updateAppointmentResult = Appointment | AppointmentNotFoundError | authorisationError
union deleteAppointmentResult = Appointment | AppointmentNotFoundError | authorisationError
union createFacilityResult = Facility | facilityExistsError | invalidFacilityError
union activationResult = successfulActivation | passwordMismatchError | alreadyActivatedError | invalidTemporaryPasswordError | invalidActivationError |userNotFoundError



type Query{
    hello: String
    getAllAppointments: [Appointment]
    getVisits(cohort:CohortInput!):[String]
    getUsers:[User]
    getFacilities:[Facility]
}

type Mutation{
    createAppointment(visit:String!,cohorts:[CohortInput!]!):createAppointmentResult
    updateAppointment(visit:String!,cohorts:[CohortInput!]!):updateAppointmentResult
    deleteAppointment(visit:String!):deleteAppointmentResult
    login(username:String!,password:String!):loginResult
    register(name:String!,surname:String!,username:String!,code:String!,role:String!):registrationResult
    createFacility(name:String!,code:String!):createFacilityResult
    activate(username:String!,temporaryPassword:String!,password:String!,confirmPassword:String!):activationResult
}
`;

module.exports = typeDefs;