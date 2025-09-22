import { app } from './app'
import { env } from './env'

app
  .listen({
    host: 'localhost',
    port: env.PORT,
  })
  .then(() => {
    console.log(`Server listening on http://localhost:${env.PORT}`)
  })
  .catch((err) => {
    console.error(err)
    process.exit(1)
  })
