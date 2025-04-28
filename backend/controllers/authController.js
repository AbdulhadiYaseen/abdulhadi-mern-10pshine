const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const User = require('../models/Note')

const SECRET = 'your_jwt_secret_key'

exports.signup = async (req,res) => {
    try{
        const {name,email,password} = req.body

        const hashedPassword = await bcrypt.hash(password,10)
        const user = await User.create({name,email,password: hashedPassword})

        res.status(201).json({message: 'User created successfully', userId: user.userId})
    } catch(err){
        res.status(500).json({message:'Signup failed',error:err.message})
    }
}

exports.login = async (req,res) =>{
    try{
        const {email,password} = req.body

        const user = await User.findOne({where:{email}})
        if(!user) return res.status(401).json({message:'Invalid Credentials'})

        const isMatch = await bcrypt.compare(password,user.password)
        if(!isMatch) return res.status(401).json({message:'Invalid Credentials'})

        const token = jwt.sign({userId: user.userId},SECRET,{expiresIn:'1h'})

        res.json({message:'Login Successful',token})
    } catch(err){
        res.status(500).json({message: 'Login Failed',error:err.message})
    }
}