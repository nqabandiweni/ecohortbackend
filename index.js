const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const  typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const mongoose = require('mongoose');
const loc = 'mongodb://127.0.0.1:27017/cohortsdb'
const PORT = process.env.port || 5000

const createContext = (request) => {

    if(!request.req.headers.authorization){
        return null
    }else{
        const token = request.req.headers.authorization
        return {token}
    }
}

async function startApolloServer() {
  try {
    const app = express();
    const httpServer = http.createServer(app);
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context:createContext,
      plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
    });
    await server.start();
    
    server.applyMiddleware({ app });
    await new Promise(resolve => httpServer.listen(PORT, resolve));
    await mongoose.connect(loc,{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        .then(() =>console.log('Mongo good to go'))
        .catch(err => console.log(`DB error: \n ${err}`))
    console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
  } catch (error) {
      
  }  
  
}
startApolloServer()