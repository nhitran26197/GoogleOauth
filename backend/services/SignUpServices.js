import {createClient} from '@libsql/client';
import 'dotenv/config';

import bcrypt from 'bcrypt';
import nodemailer from 'nodemailer';
import {v4 as uuid} from 'uuid';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();





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
            http://localhost:${process.env.PORT}/verify/${url_id}  
            Thanks`
    }

    try{
        await transporter.sendMail(mailConfiguration)
        console.log("Email sent successfully")
        return "success"
    }catch(err){
        console.log(err.message)
        return "fail"
    }

}

const signUp = async (fastify, email, password) =>{
    try {
        await dbconnector.execute({
            sql: 'INSERT INTO user(email) VALUES(:email)',
            args: { email: email}
        });
        const id = uuid()
        const hashResult = await hashedPW(id,email,password)
        if (hashResult === "success"){
            const res= await sendingMailConfirmation(fastify, email)
            return ("success")
        }else{
            return ("fail")
        } 
        

    } catch (e) {
        console.error(e.message); 
        reply.send({message: "email exists"})
    }
}

const verifyEmail = async (fastify, id) =>{
    const res= await dbconnector.execute({
        sql:'SELECT token FROM email_verification WHERE id =?',
        args : [id]
    
    })
    const token = res.rows[0].token
    let email;
    
    try{
        const decode = await fastify.jwt.verify(token)

        email = decode.email
        await dbconnector.execute({
            sql:'UPDATE user SET confirmed = 1 WHERE email =?',
            args : [email]
        })
        await dbconnector.execute({
            sql:'DELETE FROM email_verification WHERE id =?',
            args : [id]
        })
        console.log("account verified")
        return("account verified")

    }catch(err){
        console.log("token expired")
        return ("token expired")

    }


}

const verifyGoogleAccount = async( credential) =>{
     
        try {
            const ticket = await client.verifyIdToken({
                idToken: credential,
                audience: process.env.GOOGLE_CLIENT_ID
            });
            const payload = ticket.getPayload();
            console.log(payload);
            const email = payload['email'];
            const googleID = payload['sub']
            const name = payload['name']
            const avatarURL = payload['picture']

            
            return { email: email,
                    googleID:googleID,
                    name:name,
                    avatar: avatarURL}
            

        } catch (err) {
            console.log(err);
            return "fail"

        }
    }


const addUserSignedUpWithGoogle = async (email, googleID, name, avatar) =>{
    try{
        const userID = uuid()
        await dbconnector.execute({
            sql:"INSERT INTO user (userID, googleID, email, name, avatar, confirmed) VALUES (?,?,?,?,?,?)",
            args: [userID, googleID, email, name,avatar, 1]
        })
        return "success"
    }catch(e){
        return "fail"
    }
}



const hashedPW = async function hashingPassword(userID,email, password){
    const workfactor = process.env.WORK_FACTOR          
    const salt = await bcrypt.genSalt(workfactor)

    try{
        const hashedpw = await bcrypt.hash(password, salt)

        try{
            const updateDB = dbconnector.execute({
                sql:'UPDATE user SET userID= ?, password =? WHERE email =?',
                args : [userID,hashedpw,email]
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




export {signUp, verifyEmail, verifyGoogleAccount, addUserSignedUpWithGoogle };

