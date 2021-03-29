document.addEventListener('DOMContentLoaded', e => {

    const newChanBtn = document.getElementById('newChanBtn')

    newChanBtn.addEventListener('click', e => {    
    
        const listedUsers = document.getElementById('listedUsers')
        const users = document.getElementsByClassName('userBtn')
        let userArray = Array.from(users)
        const selectedUsersArray = []
        const statusMsg = document.getElementById('FEmsg')
        const current = document.getElementById('user')
        const store = document.getElementById('store')
        let ids = [current.dataset.userid]

        store.setAttribute('value', JSON.stringify(Object.values(ids)))

        selectedUsersArray.push(
            {
                username: ` ${current.dataset.username}`,
                userId: current.dataset.userid
            }
        )
        
        userArray.map(user => {
            user.addEventListener('click', e => {
                if(selectedUsersArray.filter(item => item.userId === user.id).length < 1){
                    statusMsg.innerHTML = ''
                    while(listedUsers.firstChild){
                        listedUsers.removeChild(listedUsers.lastChild)
                    }
                    selectedUsersArray.push(
                        {
                            username: ` ${user.innerHTML}`,
                            userId: user.id
                        }
                    )
                    selectedUsersArray.map(item => {
                        let user = document.createElement('li')
                        user.textContent = item.username
                        listedUsers.appendChild(user)
                    })
                } else {
                    statusMsg.innerHTML = 'User removed'
                    while(listedUsers.firstChild){
                        listedUsers.removeChild(listedUsers.lastChild)
                    }
                    let index = selectedUsersArray.map(item => item.userId).indexOf(user.id)
                    if(index !== -1){
                        selectedUsersArray.splice(index, 1)
                    }
                    selectedUsersArray.map(item => {
                        let user = document.createElement('li')
                        user.textContent = item.username
                        listedUsers.appendChild(user)
                    })
                }
                ids = selectedUsersArray.map(({username, ...item}) => item.userId)
                store.setAttribute('value', JSON.stringify(Object.values(ids)))
            })
        })
    })
})