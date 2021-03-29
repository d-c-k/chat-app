const socket = io()

const form = document.getElementById('form')
const input = document.getElementById('input')
const chatWindow = document.getElementById('innerChatWindow')
const userData = document.getElementById('user')
const notifications = document.getElementById('notifications')

const username = userData.dataset.username
const userId = userData.dataset.userid
const channel = userData.dataset.channelid
const dm = userData.dataset.dm

const usersListDiv = document.getElementById('users')
const channelsListDiv = document.getElementById('channels')
const newUsersListDiv = document.getElementById('newChatUsers')

let notificationArr = []

function createUserListElement(username, id, element, style, active){
    let chatLink = document.createElement('form')
    chatLink.setAttribute('action', '/direct_msg')
    chatLink.setAttribute('method', 'POST')

    let input1 = document.createElement('input')
    input1.setAttribute('type', 'hidden')
    input1.setAttribute('name', 'username')
    input1.setAttribute('value', username)

    let input2 = document.createElement('input')
    input2.setAttribute('type', 'hidden')
    input2.setAttribute('name', 'userId')
    input2.setAttribute('value', id)

    let submit = document.createElement('input')
    submit.setAttribute('type', 'submit')
    submit.setAttribute('style', style)
    active
    ?
    submit.setAttribute('value', `=> ${username}`)
    :
    submit.setAttribute('value', username)
    
    chatLink.appendChild(input1)
    chatLink.appendChild(input2)
    chatLink.appendChild(submit)
    element.appendChild(chatLink)
}

function createNewUserListElement(username, id, element, style){
    let br = document.createElement('br')
    let btn = document.createElement('button')
    btn.setAttribute('type', 'button')
    btn.setAttribute('class', 'userBtn')
    btn.setAttribute('id', id)
    style && btn.setAttribute('style', style)
    btn.innerHTML = username
    element.appendChild(btn)
    element.appendChild(br)
}

function createChannelButton(channelName, id, element, users, active){
    let chanLink = document.createElement('form')
    chanLink.setAttribute('action', '/channel')
    chanLink.setAttribute('method', 'POST')

    let input1 = document.createElement('input')
    input1.setAttribute('type', 'hidden')
    input1.setAttribute('name', 'channel_name')
    input1.setAttribute('value', channelName)

    let input2 = document.createElement('input')
    input2.setAttribute('type', 'hidden')
    input2.setAttribute('name', 'users')
    input2.setAttribute('value', JSON.stringify(Object.values(users)))

    let input3 = document.createElement('input')
    input3.setAttribute('type', 'hidden')
    input3.setAttribute('name', 'channel_id')
    input3.setAttribute('value', id)

    let submit = document.createElement('input')
    submit.setAttribute('type', 'submit')
    active
    ? 
    submit.setAttribute('value', `=> ${channelName}`)
    :
    submit.setAttribute('value', channelName)
    
    chanLink.appendChild(input1)
    chanLink.appendChild(input2)
    chanLink.appendChild(input3)
    chanLink.appendChild(submit)
    element.appendChild(chanLink)
}

document.addEventListener('DOMContentLoaded', e => {
    socket.emit('updateList', () => {})
})

socket.on('updateList', data => {
    activeUsers = data.users.filter(user => user.is_active === true && user._id != userId)
    inactiveUsers = data.users.filter(user => user.is_active === false && user._id != userId)
    
    while(usersListDiv.firstChild){
        usersListDiv.removeChild(usersListDiv.lastChild)
    }
    while(channelsListDiv.firstChild){
        channelsListDiv.removeChild(channelsListDiv.lastChild)
    }
    while(newUsersListDiv.firstChild){
        newUsersListDiv.removeChild(newUsersListDiv.lastChild)
    }

    activeUsers.map(item => {
        if(item._id === dm){
            createUserListElement(item.username, item._id, usersListDiv, 'color:#00ff41', true)
        } else {
            createUserListElement(item.username, item._id, usersListDiv, 'color:#00ff41')
        }
        createNewUserListElement(item.username, item._id, newUsersListDiv, 'color:#00ff41')
    })
    inactiveUsers.map(item => {
        if(item._id === dm){
            createUserListElement(item.username, item._id, usersListDiv, 'color:#008f11', true)
        } else {
            createUserListElement(item.username, item._id, usersListDiv, 'color:#008f11')
        }
        createNewUserListElement(item.username, item._id, newUsersListDiv)
    })

    let activeChannels = []
    data.channels.map(item => {
        let index = item.userIds.map(innerItem => innerItem._id).indexOf(userId)
        if(index !== -1){
            activeChannels.push(item)
        }
    })

    let general = {
        channelName: '-GENERAL-',
        userIds: [],
        _id: 'general',        
    }

    activeChannels.unshift(general)

    activeChannels.map(item => {
        if(item._id === channel){
            createChannelButton(item.channelName, item._id, channelsListDiv, item.userIds, true)
        } else {
            createChannelButton(item.channelName, item._id, channelsListDiv, item.userIds)           
        }
    })

})

if(channel !== 'general'){
    socket.emit('setChannel', {username, userId, channel})
} else {
    socket.emit('connectUser', {username, userId, channel})
}

socket.on('channelData', ({messages}) => {
    while(chatWindow.firstChild){
        chatWindow.removeChild(chatWindow.lastChild)
    }
    if(messages.length > 0){
        messages.map(msgItem => {
            let item = document.createElement('P')
            item.textContent = `${msgItem.senderId.username}: ${msgItem.messageBody}`
            chatWindow.appendChild(item)
        })
    }

    chatWindow.scrollTop = chatWindow.scrollHeight
})

form.addEventListener('submit', e => {
    e.preventDefault()

    if(input.value){
        socket.emit('chatMessage', input.value)
    }
    input.value = ''    
})

socket.on('chatMessage', data => {
    let item = document.createElement('P')
    item.textContent = `${data.username}: ${data.message}`
    chatWindow.appendChild(item)

    chatWindow.scrollTop = chatWindow.scrollHeight
    
    /* ---Notiser WIP---
    if(data.channelId !== channel){
        console.log('hej')
        notificationArr.push({channel: channelName, id: channelId})
    }
    while(notifications.firstChild){
        notifications.removeChild(notifications.lastChild)
    }
    if(notificationArr.length > 0){
        notificationArr.map(noteItem => {
            let item = document.createElement('P')
            item.textContent = `New message in ${noteItem.channel}`
            notifications.appendChild(item)
        })
    }
    console.log(notificationArr)
    */
})