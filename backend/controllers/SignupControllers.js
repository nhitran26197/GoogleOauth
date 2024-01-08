import {signUp, verifyEmail,  verifyGoogleAccount, addUserSignedUpWithGoogle} from '../services/SignUpServices.js';

async function routes(fastify, options){

    //APIs: /createAccount post request
    fastify.post("/signup", async (request, reply) => {
        const email = request.body.email;
        const password = request.body.password
        console.log({email: email, password: password})
        const res = await signUp(fastify,email, password)
        if (res === "success"){
            reply.status(200).send({message: 'success'}) 
        }else{
            reply.status(500).send({message: 'fail'})
        }
        
        
    });

    //APIs: verify email 

    fastify.get('/verify/:id', async (request, reply) =>{
        const {id} = request.params
        const res = await verifyEmail(fastify, id)
        if (res === "token expired"){
            reply.status(401).send({message: "token expired"})
        }else{
            reply.status(200).send({message: "Account verified"})
        }
    })



    //APIs sign up with google oauth
    fastify.post("/SignupWithGoogle", async (request, reply)=>{
        const credential = request.body.credential

        const res = await verifyGoogleAccount( credential)

        if (res=== "fail"){
            reply.status(500).send({message: "fail"})
        }else{
            console.log(res.email)
            const addResult = await addUserSignedUpWithGoogle(res.email, res.googleID, res.name, res.avatar)
            reply.status(200).send({message: "success"})
        }
          
})

 
}

export default routes;