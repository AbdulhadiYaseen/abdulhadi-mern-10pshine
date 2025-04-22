const express = require('express')
const router = express.Router()
const userController = require('../controllers/user')

router.get('/users', userController.getUsers)

router.post('/post')


module.exports = router