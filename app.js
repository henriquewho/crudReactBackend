const express = require('express')
const app = express()
const cors = require('cors')
const config = require('./utils/config')
const middleware = require('./utils/middleware')
const logger = require('./utils/logger')

const loginRouter = require('./controllers/login')
const usersRouter = require('./controllers/users')
const itemsRouter = require('./controllers/items')

const mongoose = require('mongoose')
logger.info('connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
.then(()=>{
    logger.info('connected to MongoDB on ', config.MONGODB_URI)
})
.catch( err => {
    logger.error('error connecting: ', err.message)
})

app.use(express.json())
app.use(cors())

app.use(middleware.tokenExtractor)
app.use(middleware.userExtractor)

app.use('/api/login', loginRouter)
app.use('/api/users', usersRouter)
app.use('/api/items', itemsRouter)

module.exports = app