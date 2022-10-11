const { ApolloServer } = require('apollo-server-express');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
require('dotenv').config()
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const http = require('http');
const cron = require('node-cron');
const  typeDefs = require('./typeDefs');
const resolvers = require('./resolvers');
const mongoose = require('mongoose');
const loc = 'mongodb://127.0.0.1:27017/cohortsdb'
const host = '0.0.0.0';
const Appointment = require('./models/appointment.model')

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
    await new Promise(resolve => httpServer.listen(process.env.PORT || 3000, resolve));
    await mongoose.connect(process.env.MONGODB_URI,{
            useUnifiedTopology: true,
            useNewUrlParser: true
        })
        .then(() =>console.log('Mongo good to go'))
        .catch(err => console.log(`DB error: \n ${err}`))
    console.log(`🚀 Server ready at ${PORT}${server.graphqlPath}`);
  } catch (error) {
      
  }  
  
}
startApolloServer()

cron.schedule('1 1 1 * *', async () => {
var todayDate = new Date()
var day = todayDate.getDate()
var month = todayDate.getMonth() + 1
var year = todayDate.getFullYear()
var formated = `${day}-${month}-${year}`
console.log("cron Job Deleting Old Appointments")
var visits=[]
try {
  const appointments = await Appointment.find({})
  const convertToDate = (d) => {
    const [day, month, year] = d.split("-");
    return new Date(year, month - 1, day);
  }
 
 for(var i=0;i<appointments.length;i++){
    if(convertToDate(appointments[i].visit)<convertToDate(formated)){
      visits.push(appointments[i].visit)
    }
 }

 await Appointment.deleteMany({ visit: { $in: visits } })

  
} catch (error) {
  console.log(error)
}
 
 

});