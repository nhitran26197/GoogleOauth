import {createClient} from '@libsql/client';
import 'dotenv/config';
import validateEmail from 'node-email-check';
import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import {v4 as uuid} from 'uuid';



// create workfactor for password hashing
const workfactor = 5

// connect to Turso DB
const dbconnector = createClient({
        url: "libsql://user-login-nhitran26197.turso.io",
        authToken: process.env.DB_TOKEN
    });

//create a nodemailer transporter
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
            http://localhost:3000/verify/${url_id}  
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

    //APIs: /createAccount post request
    fastify.post("/createAccount", async (request, reply) => {
        const email = request.body.email;
        const password = request.body.password
        const res = await validateEmail.isValid(email);

        if (res){
            try {
                await dbconnector.execute({
                    sql: 'INSERT INTO user(email) VALUES(:email)',
                    args: { email: email}
                });
            
            } catch (e) {
                console.error(e.message); 
                reply.send({message: "email exists"})
            }
          
        }else{
            console.log(" invalid email")
            reply.send({message:"invalid email"})
        } 
        const id = uuid()
        const hashResult = await hashedPW(id,email,password, workfactor)
        

        if (hashResult === "success"){
            const res= await sendingMailConfirmation(fastify, email)}
        reply.status(200).send({message: 'success'}) 

        
    });

    //APIs: verify email 

    fastify.get('/verify/:id', async (request, reply) =>{
        const {id} = request.params
        
        const res= await dbconnector.execute({
            sql:'SELECT token FROM email_verification WHERE id =?',
            args : [id]
        
        })
        const token = res.rows[0].token
        let email;
        
        try{
            const decode = await fastify.jwt.verify(token)

            email = decode.email
            console.log(email)
        }catch(err){
            console.log("token expired")
            reply.status(401).send({message: "token expired"})
        }

        await dbconnector.execute({
            sql:'UPDATE user SET confirmed = 1 WHERE email =?',
            args : [email]
        })
    })
 
}



//hashing password
const hashedPW = async function hashingPassword(id,email, password, workfactor){
                 
    const salt = await bcrypt.genSalt(workfactor)
    try{
        const hashedpw = await bcrypt.hash(password, salt)

        try{
            const updateDB = dbconnector.execute({
                sql:'UPDATE user SET id= ?, password =? WHERE email =?',
                args : [id,hashedpw,email]
            })
            return "success"
        }catch(e){
            return "fail"
        }
    }catch(e){
        console.log(e.message)
        return "Fail"
    }
        
}
export default routes;

