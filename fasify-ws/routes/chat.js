const client = [];

async function chat(fastify, options) {

    fastify.get("/chat", {websocket: true}, (connection,req) =>{
        
        client.push(connection);

        connection.on('message', message => {
            console.log(message.toString());
            client.forEach(client => {
                client.send('you said: ' + message)
            });
        connection.on('close', () =>{
            const index = client.indexOf(connection);
            if (index !== -1)
            {
                console.log("client removed successfully")
                client.splice(index, 1);
            }
        })
        })
    })
    
    fastify.get('/me', async (req , rep) => 
    {
        return {message:"hello anas amellahe"}
    })
}

module.exports = chat;