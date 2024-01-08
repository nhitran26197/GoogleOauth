import {login, changePasswordEmailVerify, sendingMailConfirmation, changePassword, verifyGoogleAccount} from "../services/LoginServices.js"

async function routes(fastify, options){
    
    //APIs: /login post request
    fastify.post("/login", async (request, reply) =>{
        const email = request.body.email
        const password = request.body.password
        const res = await login()
        if (res ==="success"){
            reply.status(200).send({message:"success"})
        }else{
            reply.status(401).send({message:"fail"})
        }
    })

    fastify.post("/loginWithGoogle", async (request, reply)=>{
        const credential = request.body.credential

        const res = await verifyGoogleAccount(credential)
        if (res ==="fail"){
            reply.status(500).send({message:"fail"})


        }else{
            reply.status(200).send({message:"success"})
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
        const res = await changePasswordEmailVerify(fastify, id)
        if (res ==="email verified"){
            reply.status(200).send({message:"success"})
        }else{
            reply.status(401).send({message:"fail"})
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
        const res = await changePassword(email, password)
        if (res==='success'){
            reply.status(200).send({message:"success"})
        }else{
            reply.status(500).send({message:"fail"})
        }
        
    })

}
export default routes;