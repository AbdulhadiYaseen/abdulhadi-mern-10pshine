const express = require('express') 
const app = express()
const port = 3000
const cors = require('cors')
const pino = require('pino-http')
const errorhandler = require('./middleware/errorHandler')
const logger = require('./middleware/logger')
const routes = require('./routes/user')

app.use(logger)
app.use(cors())
app.use(express.json())
app.use(pino)
app.use(errorhandler)

const userRoutes = require('./routes/user')

app.use('/api/users', userRoutes)


app.listen(port, () => {
    console.log(`Server running on ${port}`)
})