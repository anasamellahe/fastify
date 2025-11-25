async function routes(fastify, options) {

    fastify.get('/health', async (req, rep) =>{
        return {ok: true}
    })
    
}

module.exports = routes;