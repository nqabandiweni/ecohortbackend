const bodyParser = require('body-parser');
const cors = require('cors');
const express = require('express')
require('dotenv').config();
const {ApolloServer,gql} = require('apollo-server-express')
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core')
const typeDefs = require('./typeDefs')
const resolvers = require('./resolvers')
const mongoose = require('mongoose')
const uri = process.env.MONGODB_URI;
const PORT = process.env.PORT || 5000


async function startServer(){
    const app = express();
    // Enable pre-flighting on all requests.
// See: https://www.npmjs.com/package/cors#enabling-cors-pre-flight
app.options('*', cors());
// Only allow cross origin requests
// coming from the URL specified above.
app.use(cors({ origin: "*"}));
    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        plugins: [
            ApolloServerPluginLandingPageGraphQLPlayground({
                // options
            })
            
        ]
    });
    try {
        await apolloServer.start()
        apolloServer.applyMiddleware({app:app})
        app.use((req,res)=>{
            res.send("Hello from Express Server")
        })
        await mongoose.connect(uri,{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        .then(() =>console.log('Mongo good to go'))
        .catch(err => console.log(`DB error: \n ${err}`))
    
        app.listen(PORT,()=>console.log(`running on Port ${PORT}`))

    } catch (error) {
        console.log(`error starting up ${error}`)
    }
    
}
startServer()