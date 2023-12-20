
import bcrypt from 'bcrypt'
import {createClient} from '@libsql/client';
import 'dotenv/config';
import {promisify} from 'util';




const dbconnector = createClient({
    url: "libsql://user-login-nhitran26197.turso.io",
    authToken: process.env.DB_TOKEN
});
const compare = promisify(bcrypt.compare)

async function routes(fastify, options){
    fastify.register(async function login(fastity, options){
        fastify.post("/login", async (request, reply) =>{
            const email = request.body.email
            const password = request.body.password
            console.log(email, password)
            
            const res = await dbconnector.execute({
                sql:'select email, password from user where email = ? ',
                args: [email]
            })
            if (res.rows){
                
                    const hashedpw = res.rows[0][1]
                    console.log(hashedpw)
                    const result = await compare(password, hashedpw)
                    
                    if (result){
                        
                        console.log("login success")
                       
                        try{
                            const token = await fastify.jwt.sign({email: email}, {expiresIn: '5m'})

                            reply
                                .setCookie('token', token, {
                                httpOnly: true,
                                sameSite: true // alternative CSRF protection
                                })
                                .code(200)
                                .send('Cookie sent')

                        }catch(err){
                            console.log(err)
                        }
                        
                    }else{
                        console.log("wrong password")
                        reply.send({message:"wrong password"})

                    }
                    
                
            }else{
                console.log("account does not exist")
                reply.send({message:"account does not exist"})
            }
        
        })
    })
    fastify.register(async function(fastify,options){
        fastify.post("/auth", {
            onRequest: [fastify.authenticate]
          },async (request, reply)=>{
            const user = request.email
            console.log(user)

        })
    })
   fastify.register(async function(fastify, options){
    fastify.post("/logOut",{onRequest: [fastify.authenticate]}, async (request, reply)=>{
        reply.setCookie('token','',{expires:new Date(0), httpOnly: true})
        reply.send("Logged Out")
    })
   })
}

export default routes;