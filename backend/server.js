// ESM
import Fastify from 'fastify';
import LoginRoutes from './controllers/LoginControllers.js';
import SignupRoutes from "./controllers/SignupControllers.js"

import 'dotenv/config';
import authPlugin from "./authentication.js";
import cors from '@fastify/cors';





const fastify = Fastify({logger: false})

fastify.register(cors,{
  origin: ["http://localhost:3000"],
  methods: ["GET", "POST","PUT", "DELETE"],
})
fastify.register(authPlugin)
fastify.register(SignupRoutes)
fastify.register(LoginRoutes)



fastify.listen({ port: process.env.PORT }).then(() => {
  console.log("listening to port 3001");
}).catch((err) => {
  fastify.log.error(err);
  process.exit(1);
});




