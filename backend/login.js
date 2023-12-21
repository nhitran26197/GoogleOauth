
import bcrypt from 'bcrypt'
import {createClient} from '@libsql/client';
import 'dotenv/config';
import {promisify} from 'util';

//APIs: /login 
//      /auth
//     /logOut


const dbconnector = createClient({
    url: "libsql://user-login-nhitran26197.turso.io",
    authToken: process.env.DB_TOKEN
});
const compare = promisify(bcrypt.compare)

async function routes(fastify, options){
    
    //APIs: /login post request
    fastify.post("/login", async (request, reply) =>{
        const email = request.body.email
        const password = request.body.password
       
        
        
        const res = await dbconnector.execute({
            sql:'select email, password, confirmed from user where email = ? ',
            args: [email]
        })

        if (res.rows){
                
                const user = res.rows[0]

                if (!user.confirmed){
                    reply.send({message:"account not confirmed"})
                    return "account not confirmed"
                }
                const hashedpw = user.password           
                const result = await compare(password, hashedpw)
                
                if (result){
                    
                    console.log("login success")
                    
                    try{
                        const token = await fastify.jwt.sign({email: email}, {expiresIn: '10d'})

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
    //APIs: /auth post request
    fastify.post("/auth", {
        onRequest: [fastify.authenticate]
        },async (request, reply)=>{
        const user = request.email
        console.log(user)

    })
    //APIs: /logOut post request
    fastify.post("/logOut",{onRequest: [fastify.authenticate]}, async (request, reply)=>{
        reply.setCookie('token','',{expires:new Date(0), httpOnly: true})
        reply.send("Logged Out")
})

}

export default routes;