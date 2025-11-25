const db = require("../db/init-db")

async function routes(fastify, options) {
  fastify.get('/health', async () => {
    return { ok: true }
  })

  fastify.post('/users', async (req, rep) => {
    const { email } = req.body

    if (!email) {
      return rep.code(400).send({ error: "email required" })
    }

    const stmt = db.prepare("INSERT INTO user (email) VALUES (?)")

    try {
      const result = stmt.run(email)
      return rep.code(201).send({
        id: result.lastInsertRowid,
        email
      })
    } catch (err) {
      return rep.code(400).send({ error: err.message })
    }
  })
}

module.exports = routes
