
async function routes(fastify, options){
    const res = fastify.get("/", async(request, reply) =>{
        return "hello"
    })
}
export default routes