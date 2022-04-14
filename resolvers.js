const moduledResolvers = require('./ResolverModules')
const resolvers = {
      ...moduledResolvers.resolveTypes,
      Query:{
        ...moduledResolvers.Query
      },
      Mutation:{
        ...moduledResolvers.Mutation
      }

     
}


module.exports = resolvers;