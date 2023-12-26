
import bcrypt from 'bcrypt'
import {createClient} from '@libsql/client';
import 'dotenv/config';
import {promisify} from 'util';
import nodemailer from 'nodemailer';
import {v4 as uuid} from 'uuid';


const workfactor = 5
//APIs: /login 
//      /auth
//     /logOut


const dbconnector = createClient({
    url: "libsql://user-login-nhitran26197.turso.io",
    authToken: process.env.DB_TOKEN
});
const compare = promisify(bcrypt.compare)

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth:{
        user: process.env.GMAIL_USER,
        pass:process.env.GMAIL_PW
    }
})
// sending mail confirmations
const sendingMailConfirmation = async (fastify, usermail)=>{
   
        const token = await fastify.jwt.sign({email: usermail}, {expiresIn: '10m'})
       
        console.log(token)
        const endcodedToken = encodeURIComponent(token)

        const url_id= uuid()
        const res= await dbconnector.execute({
            sql:'INSERT INTO email_verification(id, email, token) VALUES(?,?,?)',
            args : [url_id, usermail, token]
        })

    const mailConfiguration = {
        from: process.env.GMAIL_USER,
        to : usermail,
        subject: "Account Verification",
        text:`Please follow the given link to verify your email 
            http://localhost:3000/changePasswordEmailVerify/${url_id}  
            Thanks`
    }
    console.log(mailConfiguration)
    try{
        await transporter.sendMail(mailConfiguration)
        console.log("Email sent successfully")
        return "success"
    }catch(err){
        console.log(err.message)
        return "fail"
    }

}

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
    // using authenticate decorator
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

    fastify.get("/changePasswordEmailVerify/:id", async (request, reply)=>{
        const {id} = request.params
  
        
        const res= await dbconnector.execute({
            sql:'SELECT token FROM email_verification WHERE id =?',
            args : [id]
        
        })
        const token = res.rows[0].token
        try{
            await fastify.jwt.verify(token)
            reply.status(200).send({message:"Email verified"})
        }catch(err){
            console.log("token expired")
            reply.status(401).send({message: "token expired"})
        }
    })
    // APIs sending change password verfication email
    fastify.post("/forgotPassword", async(request, reply)=>{
        const email = request.body.email
        try{
            await sendingMailConfirmation(fastify, email)
            reply.status(200).send({message:"Reset password email sent"})
        }catch(err){
            console.log(err.message)
            reply.status(401).send({message:"Sending email fail"})
        }
    
    })

    fastify.post("/changePassword", async(request, reply)=>{
        const email = request.body.email
        const password = request.body.password

        const salt = await bcrypt.genSalt(workfactor)
        const hashedPW = await bcrypt.hash(password, salt)
        console.log(hashedPW)
        try{
            await dbconnector.execute({
                sql:'UPDATE user SET password = ? where email =?',
                args:[hashedPW, email]
            })
            reply.status(200).send({message:"Password updated"})
        }catch(err){
            console.log("Change password failed")
            reply.status(500).send("Password changed unsuccesfully")
        }

    })

}

export default routes;