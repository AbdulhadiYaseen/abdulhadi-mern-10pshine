const users = require('../models/user')

exports.getUsers = (req,res) => {
    users.getAllUsers((err,users) => {
        if(err){
            return res.status(500).json({error: 'Database error'})
        }
        res.json(users)
    })
}

exports.addUser = (req,res) => {
    users.addUser((err,users))
}