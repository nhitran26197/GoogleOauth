// ESM
import Fastify from 'fastify';
import login from './login.js';
import createAccountRoutes from "./createAccount.js"

import 'dotenv/config';
import authPlugin from "./authentication.js"





const fastify = Fastify({logger: false})
fastify.register(authPlugin)
fastify.register(createAccountRoutes)
fastify.register(login)


fastify.listen({ port: process.env.PORT }).then(() => {
  console.log("listening to port 3000");
}).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});




