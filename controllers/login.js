const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

// test the api/login
loginRouter.get('/', (req, res) => {
    res.send('loginROuter ok')
})

// Login try via post request. Search for the username in the db, compares the password with bcrypt
// If successfull, returns login token needed for some operations in other APIs
loginRouter.post('/', async (req, res) => {
    const body = req.body; 
    const user = await User.findOne({username: body.username})

    const passwordCorrect = (user === null) 
    ? false 
    : await bcrypt.compare(body.password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        //console.log('Login try with no user or incorrect password')
        return res.status(401).json({error: 'invalid username or password'})
    }

    const userForToken = {
        username: user.username, id: user._id
    }

    const token = jwt.sign(userForToken, process.env.SECRET)
    res.status(200).send({token, username: user.username, name: user.name, admin: user.admin})
})

module.exports = loginRouter; 