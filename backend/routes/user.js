const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')


router.post('/')

router.get('/users', userController.getUsers)



module.exports = router