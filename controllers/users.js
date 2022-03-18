const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')

// test the /api/users
usersRouter.get('/test', (req, res)=>{
    res.send('this is the simple response from /api/users/test')
})

// create a new user in the database via a post request
usersRouter.post('/', async (req, res)=>{
    const body = req.body; 
    const token = req.token;
    const user = req.user;

    if (!token || !user) {
        return res.status(401).json ({
            error: 'token missing or invalid'
        })
    }

    // Checks if user is admin. The 'Create user' field is already hidden in the frontend 
    // for non-admins, but just in case
    const currentUser = await User.findById(user)

    
    if (body.password.lenght<4 || body.username.length < 4) {
        return res.status(400).send(
            { error: 'Password and Username must have length > 4' }
        )
    } else if (currentUser.admin === false) {
        return res.status(400).send(
            { error: 'Must be admin to create an User' }
        )
    }

    const existing = await User.find({username: body.username})
    if (existing.length>0){
        return res.status(400).send(
            { error: 'This username is already taken' }
        )
    }

    const passwordHash = await bcrypt.hash(body.password, 10)
    const newUser = new User({
        username: body.username, name: body.name, passwordHash, admin: body.admin
    })

    const savedUser = await newUser.save(); 
    res.json(savedUser)
})

// change the user password
usersRouter.put('/:id', async (req, res) => {
    const body = req.body; 
    const token = req.token;
    const user = req.user;

    if (!token || !user) {
        return res.status(401).json ({
            error: 'token missing or invalid'
        })
    } 
    //console.log(token, user);
    
    if (body.newPass.lenght<4 || body.username.length < 4) {
        return res.status(400).send(
            { error: 'Password and Username must have length > 4' }
        )
    }

    const passwordHash = await bcrypt.hash(body.newPass, 10)
    const currentUser = await User.findOne({username: body.username})

    currentUser.passwordHash = passwordHash; 
    currentUser.save(); 
    res.send(user)
})

module.exports = usersRouter; 