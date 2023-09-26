import fastify from 'fastify'
import { transactionRoutes } from './routes/transactions'
import fastifyCookie from '@fastify/cookie'

const app = fastify()

app.register(fastifyCookie)

app.register(transactionRoutes, { prefix: 'transactions' })

export { app }
