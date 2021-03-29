document.addEventListener('DOMContentLoaded', e => {
    
    const chatList = document.getElementById('chatList')
    const chatWindow = document.getElementById('chatWindow')
    
    const newChatList = document.getElementById('newChatList')
    const newChatWindow = document.getElementById('newChatWindow')

    const newChanBtn = document.getElementById('newChanBtn')

    const hOne = document.getElementById('hOne')
    const hTwo = document.getElementById('hTwo')

    let chat = true

    newChatList.style.display = 'none'
    newChatWindow.style.display = 'none'

    newChanBtn.addEventListener('click', e => {
        if(chat){
            chatList.style.display = 'none'
            chatWindow.style.display = 'none'

            newChatList.style.display = 'block'
            newChatWindow.style.display = 'block'  
                        
            newChanBtn.innerHTML = '<< Chat <<'

            hOne.innerHTML = 'Select users:'
            hTwo.innerHTML = 'Create new channel'

            chat = false
        } else {
            chatList.style.display = 'block'
            chatWindow.style.display = 'block'
    
            newChatList.style.display = 'none'
            newChatWindow.style.display = 'none'

            newChanBtn.innerHTML = '>> New Channel >>'

            hOne.innerHTML = 'Users:'
            hTwo.innerHTML = 'Chat:'

            chat = true
        }
    })
})
