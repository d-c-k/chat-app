const express = require('express')
const router = express.Router()

const User = require('../models/User')
const Channel = require('../models/Channel')

const {ensureAuthenticated} = require('../config/auth')

router.get('/', ensureAuthenticated, async(req, res) => {    
    let user = req.session.user.username
    let id = req.session.user._id
    res.render('home', {user, id})
})

router.post('/new_channel', ensureAuthenticated, async(req, res) => {
    const user = req.session.user.username
    const id = req.session.user._id

    const channelName = req.body.channelName
    const store = JSON.parse(req.body.store)

    let errors = []

    if(!channelName){
        errors.push({msg: "Required field 'Channel name' empty"})
    }
    if(store.length < 3){
        errors.push({msg: 'Include at least two more users than yourself'})
    }
    if(errors.length > 0){
        res.render('home', {user, id, status_msg: errors})
    } else {
        await Channel.findOne({$and: [{userIds: { $size: store.length }}, {userIds: { $all : store}}]})
            .then(channel => {
                if(channel){
                    let channel_id = channel._id
                    res.render('home', {user, id, channel_id})
                } else {  
                const newChannel = new Channel({
                    channelName: channelName, 
                    userIds: store
                })
                newChannel
                    .save()
                    .then(value => {
                        let channel_id = value._id
                        res.render('home', {user, id, channel_id, status_msg: ['New channel created']})
                    })
                    .catch(error => console.log(error))
                }
            }) 
    }    
})

router.post('/channel', ensureAuthenticated, (req, res) => {
    const user = req.session.user.username
    const id = req.session.user._id

    const channelName = req.body.channel_name
    const channel_id = req.body.channel_id
    const users = JSON.parse(req.body.users)

    res.render('home', {user, id, channelName, channel_id, users})
})

router.post('/direct_msg', ensureAuthenticated, async(req, res) => {  
    const user = req.session.user.username
    const id = req.session.user._id

    await Channel.findOne({$and: [{userIds: { $size: 2 }}, {userIds: { $all : [req.session.user._id, req.body.userId]}}]})
        .then(channel => {
            if(channel){
                let channel_id = channel._id
                let dm = req.body.userId
                res.render('home', {user, id, channel_id, dm})
            } else {        
            const newChannel = new Channel({
                channelName: `${req.session.user.username} - ${req.body.username}`, 
                userIds: [req.session.user._id, req.body.userId]
            })
            newChannel
                .save()
                .then(value => {
                    let channel_id = value._id
                    let dm = req.body.userId
                        res.render('home', {user, id, channel_id, dm})
                })
                .catch(error => console.log(error))
            }  
    })  
})

module.exports = router