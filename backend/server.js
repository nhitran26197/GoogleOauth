// ESM
import Fastify from 'fastify';
import firstRoute from './our-first-route.js';
//import dbConnector from './our-db-connector.js'
import { createClient } from "@libsql/client";
import 'dotenv/config';

const fastify = Fastify({logger: true})
const client = createClient({
  url: "libsql://user-login-nhitran26197.turso.io",
  authToken: process.env.DB_TOKEN
});
//fastify.register(dbConnector)
fastify.register(firstRoute)
const test = async ()=>{
try {
  const rs = await client.execute("select * from user");
  console.log(rs.columns)
  // rs.columns == [ 'uid', 'email' ]
  // rs.rows[0] == [ 'uid1', 'foo@bar.com' ]
  // rs.rows[1] == [ 'uid2', 'baz@bar.com' ]
} catch (e) {
  console.error(e);
}
}


fastify.listen({port:3000}, function(err){
  if(err){
    fastify.log.error(err)
    process.exit(1)
  }
  console.log("listening to port 3000")
})

test()
