const axios = require("axios");

async function githubAuthRoutes(fastify, options) {

    // 1️⃣ Step 1 — Redirect user to GitHub
    fastify.get("/auth/github", async (req, reply) => {
        const clientId = process.env.GITHUB_CLIENT_ID;
        const redirectUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&scope=user:email`;

        reply.redirect(redirectUrl);
    });

    // 2️⃣ Step 2 — GitHub redirects back with ?code=...
    fastify.get("/auth/github/callback", async (req, reply) => {
        const { code } = req.query;

        if (!code) {
            return reply.code(400).send({ error: "Missing code" });
        }

        try {
            // 3️⃣ Exchange code for access token
            const tokenRes = await axios.post(
                "https://github.com/login/oauth/access_token",
                {
                    client_id: process.env.GITHUB_CLIENT_ID,
                    client_secret: process.env.GITHUB_CLIENT_SECRET,
                    code,
                },
                {
                    headers: { Accept: "application/json" },
                }
            );

            const accessToken = tokenRes.data.access_token;

            if (!accessToken)
                return reply.code(400).send({ error: "No access token" });

            // 4️⃣ Fetch user profile
            const userRes = await axios.get("https://api.github.com/user", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            // 5️⃣ Fetch email (GitHub requires this)
            const emailRes = await axios.get("https://api.github.com/user/emails", {
                headers: { Authorization: `Bearer ${accessToken}` },
            });

            const primaryEmailObj = emailRes.data.find(e => e.primary) || emailRes.data[0];
            const email = primaryEmailObj.email;

            // 6️⃣ Save user in DB (via db-service)
            const savedUser = await axios.post("http://localhost:3003/users", {email:email})
            console.log({message:"database message is ", data: savedUser.data, statusCode:savedUser.status})

            // 7️⃣ Redirect user to frontend (or return token)
            return reply.send({ email });
        } 
        catch (err) {
            console.log(err);
            return reply.code(500).send({ error: "OAuth failed" });
        }
    });
}

module.exports = githubAuthRoutes;
