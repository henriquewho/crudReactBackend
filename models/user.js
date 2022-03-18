const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String, 
        required: true
    }, 
    name: {
        type: String, 
        required: true
    },
    admin: {
        type: Boolean, required: true
    },
    passwordHash: {
        type: String, 
        required: true
    }, 
    items: [
        {
            type: mongoose.Schema.Types.ObjectId, ref: 'Item'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id 
        delete returnedObject.__v
        // the password should't be revealed
        delete returnedObject.passwordHash
    }
})

module.exports = mongoose.model('User', userSchema)