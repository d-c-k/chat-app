const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    channelId: {
        type: Schema.Types.ObjectId,
        ref: 'Channel',
        required: true
    },        
    senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now,
        required: true
    },
    messageBody: String
})

const Message = mongoose.model('Message', MessageSchema)

module.exports = Message