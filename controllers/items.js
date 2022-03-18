const itemsRouter = require('express').Router(); 
const Item = require('../models/item')
const User = require('../models/user')

// test the api/items
itemsRouter.get('/test', async (req, res)=>{
    res.send('1-this is the simple response from /api/items/test')
})

// Get list of items. If username === admin, returns all. Otherwise it returns the user's own items + public items. 
itemsRouter.get('/', async (req, res)=> {
    const body = req.body;
    const userId = req.user;            // id of the user making the request
    const userRequest = await User.findById(userId); 
    const username = userRequest.username;

    let items; 
    
    // if the user === admin, return all items from db. Otherwise, return his own + public ones only
    if (username==='admin') {
        items = await Item.find({}); 
    } else {
        items = await Item.find({user: userId});        // only items created by the current user 
        let allItems = await Item.find({user :{"$ne" : userId}, private: "public"});                 // all items 
        items = [...items, ...allItems]; 
    }

    // create the correct formatted list for the frontend
    let items2= []; 
    for (let i=0; i<items.length; i++){
        const user = await User.findById(items[i].user); 
        items2[i] = {}; 
        items2[i].user = user['username']
        items2[i].userId = items[i].user
        items2[i].content = items[i].content
        items2[i].id = items[i].id
        items2[i].private = items[i].private
    }

    res.json(items2)
})

// send the required item by id
itemsRouter.get('/:id', async (req, res)=>{
    const item = await Item.findById(req.params.id);
    const user = await User.findById(item.user)

    const item2 = {}; 
    item2.id = item.id; 
    item2.content = item.content; 
    item2.user = user.username; 
    item2.userId = user; 
    item2.private = item.private; 
    
    res.json(item2); 
})

// create new item
itemsRouter.post('/', async (req, res)=>{
    const body = req.body; 
    const userName = body.user; 
    const token = req.token;
    const user = req.user;

    if (!token || !user) {
        return res.status(401).json ({
            error: 'token missing or invalid'
        })
    }

    const searchedUser = await User.findById(user)
    const item = new Item({
        content: body.text, private: body.rights, user: searchedUser
    })

    const savedItem = await item.save(); 
    searchedUser.items = searchedUser.items.concat(savedItem._id)
    const savedUser = await searchedUser.save(); 
    res.json(savedItem)
})

// edit item
itemsRouter.put('/:id', async (req, res) => {
    const body = req.body; 
    const userName = body.user; 
    const token = req.token;
    const user = req.user;      // user id in the db

    if (!token || !user) {
        //console.log('token ', token, ' user ', user)
        return res.status(401).json ({
            error: 'token missing or invalid'
        })
    }

    const id = req.params.id; 

    const oldItem = await Item.findById(id)
    oldItem.content = body.content; 
    oldItem.private = body.private; 
    const resp = await oldItem.save(); 
    
    res.json(resp); 
})

// delete an item from the db 
itemsRouter.delete('/:id', async (req, res) => {
    const body = req.body; 
    const userName = body.user; 
    const token = req.token;
    const user = req.user;      // user id in the db

    if (!token || !user) {
        return res.status(401).json ({
            error: 'token missing or invalid'
        })
    }
    
    const id = req.params.id;

    const itemToDelete = await Item.findById(id);
    const resp = await Item.findByIdAndDelete(id); 

    // deletes the item reference from the user array of items
    const ownerUser = await User.findById(user)
    ownerUser.items = ownerUser.items.filter(each => {
        if (each.equals(itemToDelete._id)){
            console.log('found'); 
            return false; 
        }
        else return true; 
    })
    ownerUser.save(); 

    res.json(resp); 
})

module.exports = itemsRouter; 
