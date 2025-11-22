const db =  require("../database/db")


async function auth(request, replay) {

    try{
        await request.jwtVerify();
    }
    catch(err)
    {
        return replay.status(400).send({message:"a error happen when checking the token",  err:err})
    }
    
}

async function login(fastify, options) {

    fastify.post("/register", async (request, replay) =>{
  
        const {username, password, email} = request.body;
        const stmt = db.prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)")

        if (!username || !password || !email)
            return replay.status(400).send(`you most include password and email and username ops`)
        try{
            const changes = stmt.run(username, email, password);
            return {changes:changes, message:"new user created "}
        }catch(err){
            return replay.status(400).send({messageError:err, message:"can't create new user"})
        }
    })


    fastify.post('/login', async (request, replay) =>{
        const {username, password} = request.body;
        if (!username || !password)
             return replay.status(400).send(`you most include password and username ops`)
        const stmt = db.prepare("SELECT * FROM users WHERE name = ?")
        try{
            const user = stmt.get(username)
            if (!user)
                return replay.status(401).send("no user found with this username")
            if (user.password != password)
                return replay.status(401).send("invalid password")
            const payload = {id:user.id, username:user.name, iat:123456789 }
            const token = fastify.jwt.sign(payload);
            return {message:"welcome back", token:token};

        }
        catch(err)
        {
            return {message:"a error catched while processing"}
        }

    } )
    
    fastify.get("/me",{preHandler:auth} , async (request, replay)=> {

        return {message:`hello user ${request.user.username} your id is ${request.user.id} and you well expire at ${request.user.iat}  `}
    })
}
module.exports = login; 