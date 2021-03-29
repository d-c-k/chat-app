let users = []

const setUser = (username, userId, socketId, channel) => {
    const user = {
        username,
        userId,
        socketId,
        channel
    }

    users.push(user)
    return user
}

const removeUser = socketId => {
    let index = users.map(item => item.socketId).indexOf(socketId)
    if(index !== -1){
        return users.splice(index, 1)[0]
    }
}

const currentUser = socketId => {
    const user = users.find(item => item.socketId === socketId)
    return user
}

module.exports = {
    setUser,
    removeUser,
    currentUser
}