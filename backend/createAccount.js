import {createClient} from '@libsql/client';
import 'dotenv/config';
const client = createClient({
        url: "libsql://user-login-nhitran26197.turso.io",
        authToken: process.env.DB_TOKEN
    });

async function createAccountRoute(fastify, options) {
    fastify.post('/createAccount', async (request, reply) => {
     
        const username = request.body.username;
        const password = request.body.password;
        try {
            await client.execute({
                sql:'INSERT INTO user ( username, password) VALUES (:username,:password)', 
                args:{username:username, 
                      password:password}});
          
        } catch (e) {
            console.log(e);
        }
    });
}
export default createAccountRoute