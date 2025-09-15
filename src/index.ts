import { Elysia } from 'elysia'
import cors from '@elysiajs/cors'
import swagger from '@elysiajs/swagger'
import { auth } from './routes/auth'
import { store } from './routes/stores'
import { users } from './routes/users'

const app = new Elysia()

app
  .use(cors())
  .use(swagger())
  .get('/', () => {
    return (
      "This is the default server route"
    )
  })
  .use(users)
  .use(store)
  .use(auth)
  .listen(5000)

console.log('🦊 Elysia is running at http://localhost:5000');
