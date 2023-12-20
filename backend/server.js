// ESM
import Fastify from 'fastify';
import login from './login.js';
import createAccountRoutes from "./createAccount.js"
import { createClient } from "@libsql/client";
import 'dotenv/config';
import authPlugin from "./authentication.js"





const fastify = Fastify({logger: false})
fastify.register(authPlugin)
fastify.register(createAccountRoutes)
fastify.register(login)


fastify.listen(process.env.PORT, function(err){
  if(err){
    fastify.log.error(err)
    process.exit(1)
  }
  console.log("listening to port 3000")
})




