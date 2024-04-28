const express = require('express')
const router = require('./router')
const corsMiddleware = require('./middlewares/cors')

const app = express()

app.disable('x-powered-by')
app.use(express.json())
app.use(corsMiddleware)
app.use(router)

module.exports = app
