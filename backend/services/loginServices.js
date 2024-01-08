
import bcrypt from 'bcrypt'
import {createClient} from '@libsql/client';
import 'dotenv/config';
import {promisify} from 'util';
import nodemailer from 'nodemailer';
import {v4 as uuid} from 'uuid';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client();



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
            http://localhost:${process.env.PORT}/changePasswordEmailVerify/${url_id}  
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

const login  = async ( email, password)=>{
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
                await setToken()
                return "success"
                
            }else{
                console.log("wrong password")
                return "fail"

            }
            
    }else{
        console.log("account does not exist")
        return "fail"

    }


}

const setToken = async ()=>{
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
}

const changePasswordEmailVerify = async (fastify, id)=>{
    const res= await dbconnector.execute({
        sql:'SELECT token FROM email_verification WHERE id =?',
        args : [id]
    
    })
    const token = res.rows[0].token
    try{
        await fastify.jwt.verify(token)
        return "email verified"
        
    }catch(err){
        console.log("token expired")
        return "token expired"

    }
}

const changePassword = async(email, password)=>{
    const workfactor = process.env.WORK_FACTOR

        const salt = await bcrypt.genSalt(workfactor)
        const hashedPW = await bcrypt.hash(password, salt)
        console.log(hashedPW)
        try{
            await dbconnector.execute({
                sql:'UPDATE user SET password = ? where email =?',
                args:[hashedPW, email]
            })
            console.lof("changed password successfully")
            return 'Password updated'

        }catch(err){
            console.log("Change password failed")
            return "fail"

        }

}

const verifyGoogleAccount = async( credential) =>{

    try {
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        const googleID = payload['sub']
        const email = payload['email']
        const res = await dbconnector.execute({
            sql:"select googleID from user where email = ?",
            args:[email]
        })

        const googleIDResult = res.rows[0].googleID
        
        if (googleID === googleIDResult){
            console.log("login ggl account success")
            return "success"
        }else{
            console.log("login to ggl account failed")
            return "fail"
        } 

    } catch (err) {
        console.log(err);
        return "fail"

    }
}




export {login, sendingMailConfirmation, changePasswordEmailVerify, changePassword, verifyGoogleAccount};