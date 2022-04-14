const appointmentsResolvers = require('./Appointments/appointments');
const userResolvers =  require('./Users/users')

module.exports = {
    resolveTypes:{
        ...appointmentsResolvers.resolveTypes,
        ...userResolvers.resolveTypes
    },
    Query: {
        ...appointmentsResolvers.Query,
        ...userResolvers.Query
    },
    Mutation: {
        ...appointmentsResolvers.Mutation,
        ...userResolvers.Mutation
    },
};