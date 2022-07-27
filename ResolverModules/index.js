const appointmentsResolvers = require('./Appointments/appointments');
const userResolvers =  require('./Users/users')
const facilitiesResolvers = require('./Facilities/facilities')

module.exports = {
    resolveTypes:{
        ...appointmentsResolvers.resolveTypes,
        ...userResolvers.resolveTypes,
        ...facilitiesResolvers.resolveTypes
    },
    Query: {
        ...appointmentsResolvers.Query,
        ...userResolvers.Query,
        ...facilitiesResolvers.Query
    },
    Mutation: {
        ...appointmentsResolvers.Mutation,
        ...userResolvers.Mutation,
        ...facilitiesResolvers.Mutation
    },
};