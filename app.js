const express = require('express')
const app = express()
const http = require('http').Server(app)

const path = require('path')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const io = require('socket.io')(http)

require('dotenv').config()
require('./config/passport')(passport)

const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

mongoose.connect(process.env.DB_HOST, 
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('connected to db'))
    .catch(error => console.log(error))

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false}))

app.use(express.static(path.join(__dirname, 'assets')))

app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

app.use(passport.initialize())
app.use(passport.session())

app.use(flash())
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})

app.use('/users', require('./routes/users'))
app.use('/', require('./routes/index'))

const User = require('./models/User')
const Channel = require('./models/Channel')
const Message = require('./models/Message')

const {setUser, removeUser, currentUser} = require('./serverScripts/socketFuncs') 

io.on('connection', socket => {
    
    socket.on('connectUser', async({username, userId, channel}) => {
        const user = setUser(username, userId, socket.id, channel)
        User.findByIdAndUpdate(user.userId, {$set: {is_active: true}}, (error) =>{
            if(error) console.log(error)
        })
        socket.join(user.channel)        
    })
    
    socket.on('setChannel', async({username, userId, channel}) => {
        const user = setUser(username, userId, socket.id, channel)
        let channelName = ''
        let messages = []
        let channelId = ''
        User.findByIdAndUpdate(user.userId, {$set: {is_active: true}}, (error) =>{
            if(error) console.log(error)
        })
        
        socket.join(user.channel)
        
        await Channel.findOne({_id: user.channel})
        .exec((error, channel) => {
            if(error){
                return console.log(error)
            }
            Message.find({channelId: user.channel})
            .populate('senderId', 'username')
            .exec((error, dbMessages) => {
                if(error){
                    return console.log(error)
                }
                messages = dbMessages
                channelName = channel.channelName
                channelId = channel._id
                io.to(user.channel).emit('channelData', {
                    channelName: channelName,
                    channelId: channelId,
                    messages: messages
                })
            })
        })
    })
    
    socket.on('updateList', async() => {
        const user = currentUser(socket.id)
        await User.find({}, '_id username is_active')
            .exec((error, users) => {
                if(error){
                    return console.log(error)
                } 
                Channel.find({'userIds.2': { $exists: true }})   
                    .populate('userIds', 'username') 
                    .exec((error, channels) => {
                        if(error){
                            return console.log(error)
                        }
                        io.emit('updateList', {users, channels})
                    })         
                
            })
    })

    socket.on('chatMessage', message => {
        const user = currentUser(socket.id)
        if(user.channel !== 'general'){
            /* ---Notiser WIP---
            await Channel.findOne({_id: user.channel}, 'channelName')
                .exec((error, dbname) => {
                    if(error){
                        return console.log(error)
                    }
                    io.to(user.channel).emit('chatMessage', {
                        message: message, 
                        username: user.username, 
                        channelName: dbname,
                        channelId: user.channel
                    })
                })
            */
            io.to(user.channel).emit('chatMessage', {
                message: message, 
                username: user.username, 
            })
            const newMsg = new Message({
                channelId: user.channel,
                senderId: user.userId,
                messageBody: message
            })
            newMsg
                .save()
                .catch(error => console.log(error))
        } else {
            io.to(user.channel).emit('chatMessage', {
                message: message, 
                username: user.username,
            })
        }
    })

    socket.on('disconnect', async() => {
        const user = removeUser(socket.id) 
        await User.findByIdAndUpdate(user.userId, {$set: {is_active: false}}, (error) =>{
            if(error) console.log(error)              
            User.find({}, '_id username is_active')
                .exec((error, users) => {
                    if(error) console.log(error)
                    Channel.find({'userIds.2': { $exists: true }})   
                        .populate('userIds', 'username') 
                        .exec((error, channels) => {
                            if(error) console.log(error)
                            io.emit('updateList', {users, channels})
                        })         
                    
                })
        })
    })
})

http.listen(3000)