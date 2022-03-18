const logger = require('./logger')
const jwt = require('jsonwebtoken')

const requestLogger = (req, res, next) => {
    logger.info('Method =', req.method)
    logger.info('Path: ', req.path)
    logger.info('Body: ', req.body)
    logger.info('---')
    next()
}

const tokenExtractor = (req, res, next) =>{
    const auth = req.get('authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')) {
        req.token = auth.substring(7)
    }
    next()
}

// checks if the token is valid and returns the user if thats the case
const userExtractor = (req, res, next)=>{
    const auth = req.get('authorization')
    if (auth && auth.toLowerCase().startsWith('bearer ')){
        const decodedToken = jwt.verify(auth.substring(7), process.env.SECRET)
        req.user = decodedToken.id
    }
    next()
}

const unknownEndpoint = (request, response) => {
    if (request.path=='/info'){
      response.send('This is the blog backend app')
    } else
    response.status(404).send({ error: `unknown endpoint at ${request.path}` })
}
  
const errorHandler = (error, request, response, next) => {
    logger.info(`Entered the errorHandler middleware`);
    logger.error(error.message)
  
    if (error.name === 'CastError') {
      return response.status(400).send({ error: 'malformatted id' })
    } else if (error.name === 'ValidationError') {
      return response.status(400).json({ error: error.message })
    }
  
    next(error)
}
  
module.exports = {
    requestLogger,
    unknownEndpoint,
    errorHandler, 
    tokenExtractor, 
    userExtractor
}