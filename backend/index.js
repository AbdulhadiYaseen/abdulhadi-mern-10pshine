const express = require('express') 
const app = express()
const port = 3000


app.use(express.json())

const userRoutes = require('./routes/user')

app.use('/', userRoutes)


app.listen(port, () => {
    console.log(`Server running on ${port}`)
})