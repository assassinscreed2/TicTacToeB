const express = require('express')
const UserRouter = express.Router();
const {playMove,playGame,registerUser,userGames,login,deleteGame} = require('../controllers/ttt.controller')

UserRouter.post('/register',registerUser)
UserRouter.post('/playgame',playGame)
UserRouter.post('/home',userGames)
UserRouter.post('/move',playMove)
UserRouter.post('/login',login)
UserRouter.post('/deletegame',deleteGame)


module.exports = UserRouter