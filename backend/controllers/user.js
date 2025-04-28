const users = require('../models/Note')

exports.getUsers = (req,res) => {
    users.getAllUsers((err,users) => {
        if(err){
            return res.status(500).json({error: 'Database error'})
        }
        res.status(200).json(users)
    })
}

exports.addUser = (req,res) => {
    users.addUser((err,users))
}