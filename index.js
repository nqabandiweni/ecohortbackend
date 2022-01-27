const express = require('express')
const {ApolloServer,gql} = require('apollo-server-express')
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')
const mongoose = require('mongoose')

async function startServer(){
    const app = express();
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers
    });
    try {
        await apolloServer.start()
        apolloServer.applyMiddleware({app:app})
        app.use((req,res)=>{
            res.send("Hello from Express Server")
        })
        await mongoose.connect('mongodb://localhost:27017/cohortsdb',{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        .then(() =>console.log('Mongo good to go'))
        .catch(err => console.log(`DB error: \n ${err}`))
    
        app.listen(4000,()=>console.log("running on Port 4000"))

    } catch (error) {
        console.log(`error starting up ${error}`)
    }
    
}
startServer()