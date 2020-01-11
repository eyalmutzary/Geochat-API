const path = require('path')
const http = require('http')
const express = require('express')
const socketio = require('socket.io')
require('./db/mongoose')
const userRouter = require('./routers/user')
const cors = require('cors')
const User = require('./models/user')
const mongoose = require('mongoose')



const app = express()
const server = http.createServer(app)
const io = socketio(server)


const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../geochatApp')
const rooms = {}

app.use(cors())
app.use(express.static(publicDirectoryPath))
app.use(express.json())
app.use(userRouter)

io.on('connection', (socket) => {
    console.log('New WebSocket connection in')

    
    socket.on('join', (region, fullname) => {

      const room = region  
      if(!rooms[room]){
        rooms[room] = [{
          "fullname": fullname,
          "avatar": "https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_1280.png"
        }]
      }else{
        // Looking for duplicated users in a room
        var foundDup = false
        isContaines = rooms[room].forEach(user => {
          if(user.fullname == fullname)
            foundDup = true;
        });
        if(!foundDup){
          rooms[room].push({
            "fullname": fullname,
            "avatar": "https://cdn.pixabay.com/photo/2017/06/13/12/53/profile-2398782_1280.png"
          })
        }
        
      }
      socket.join(room)     

      console.log("sending users..") 
      socket.emit('sendUsersList', rooms[room])

      if(!foundDup){
          io.sockets.in(room).emit('message', {
            "sender": "",
            "senderId": "",
            "name": "",
            "avatar": "",
            "content": fullname + " has joined the room!",
            "timeStamp": new Date()
          })
      }

    })

    socket.on('sendMessage', async (message, id, region) => {
      const user = await User.findById(mongoose.Types.ObjectId(id))
      const room = region
        io.to(room).emit('message', {
              "sender": "",
              "senderId": user._id,
              "name": user.fullname,
              "avatar": user.avatar,
              "content": message,
              "timeStamp": new Date()
            })
    })

    socket.on('disconnect', (fullname, region) => {
      // console.log(rooms[region])
    })
    
    // delete the user from his room when logging out

    
})

server.listen(port, () => {
    console.log(`Server is up on port ${port}!`)
})
