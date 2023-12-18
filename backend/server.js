// ESM
import Fastify from 'fastify';

import createAccountRoutes from "./createAccount.js"
import { createClient } from "@libsql/client";
import 'dotenv/config';



const fastify = Fastify({logger: false})
const client = createClient({
  url: "libsql://user-login-nhitran26197.turso.io",
  authToken: process.env.DB_TOKEN
});


fastify.register(createAccountRoutes)


fastify.listen(process.env.PORT, function(err){
  if(err){
    fastify.log.error(err)
    process.exit(1)
  }
  console.log("listening to port 3000")
})




