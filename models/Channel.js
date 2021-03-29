const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const ChannelSchema = new Schema({
    channelName: {
        type: String,
        required: true
    },
    userIds: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }]
})

const Channel = mongoose.model('Channel', ChannelSchema)

module.exports = Channel