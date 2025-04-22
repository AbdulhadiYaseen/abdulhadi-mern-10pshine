const db = require('../config/db')

exports.getAllUsers = (callback) =>{
    db.query('Select * from users', (err,res) => {
        if (err) return callback(err)
        callback(null,res)
    })
}
