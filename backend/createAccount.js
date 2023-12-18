import {createClient} from '@libsql/client';
import 'dotenv/config';
import validateEmail from 'node-email-check';
import bcrypt from 'bcrypt';
const workfactor = 5



const dbconnector = createClient({
        url: "libsql://user-login-nhitran26197.turso.io",
        authToken: process.env.DB_TOKEN
    });
async function routes(fastify, options){

    fastify.register(async function createAccountRoute(fastify, options) {
        fastify.post('/createAccount', async (request, reply) => {
        
            const email = request.body.email;
            const password = request.body.password;
            console.log(email);
            try {
                await dbconnector.execute({
                    sql:'INSERT INTO user ( email, password) VALUES (:email,:password)', 
                    args:{email:email, 
                        password:password}});
            
            } catch (e) {
                console.log(e);
            }
        });
    });

    fastify.register(async function checkValidEmail(fastify, options){
        fastify.post("/checkValidEmail", async (request, reply) => {
            const email = request.body.email;
            const password = request.body.password
 

            const res = await validateEmail.isValid(email);
            console.log(res);
            if (res){
                try {
                    await dbconnector.execute({
                        sql: 'INSERT INTO user(email) VALUES(:email)',
                        args: { email: email}
                    });
                    const hashResult = await hashedPW(email,password, workfactor)
                    reply.send({message: hashResult})

                } catch (e) {
                    console.error(e.message); 
                    reply.send({message: "Email exists"})
                }


            }else{
                console.log(" Invalid email")
                reply.send({message:"Invalid email"})
            }            
            
        });
    });
 

}
const hashedPW = async function hashingPassword(email, password, workfactor){
        
        console.log(password)
        if (password.length<6){
            return "Minimum length of 6"
        }else{
           
            const salt = await bcrypt.genSalt(workfactor)
            try{
                const hashedpw = await bcrypt.hash(password, salt)
                console.log(hashedpw)
                try{
                    const updateDB = dbconnector.execute({
                        sql:'UPDATE user SET password =? WHERE email =?',
                        args : [hashedpw,email]
                    })
                    return "Success"
                }catch(e){
                    return "Fail"
                }
            }catch(e){
                console.log(e.message)
                return "Fail"
            }
           
        }
    }
export default routes;

