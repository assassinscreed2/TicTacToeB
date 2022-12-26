const mongoose = require('mongoose')
require('../db/model')
const User = mongoose.model('User')
const Game = mongoose.model('Game')
const {hashSync, compareSync} = require('bcrypt')
const jwt = require('jsonwebtoken')


async function isGamePresent(game){
    const res = await Game.find({users:{$all:[game.user1,game.user2]}})
    return res
}

async function isUserPresent(user){
    const res = await User.find({user: user})
    return res
}

async function deleteGame(req,res){
    const result = await Game.findByIdAndDelete(req.body._id);
    console.log(result)
    return res.json({message:"deleted"})
}

function gameStatus(game){
    if(game.x1 !== "undefined" && game.x1 === game.x2 && game.x2 === game.x3){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.y1 !== "undefined" && game.y1 === game.y2 && game.y2 === game.y3){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.z1 !== "undefined" && game.z1 === game.z2 && game.z2 === game.z3){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.x1 !== "undefined" && game.x1 === game.y1 && game.y1 === game.z1){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.x2 !== "undefined" && game.x2 === game.y2 && game.y2 === game.z2){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.x3 !== "undefined" && game.x3 === game.y3 && game.y3 === game.z3){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.x1 !== "undefined" && game.x1 === game.y2 && game.y2 === game.z3){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.x3 !== "undefined" && game.x3 === game.y2 && game.y2 === game.z1){
        if(game.turn === game.users[0]){
            return {end:true,winner:game.users[1]}
        }else{
            return {end:true,winner:game.users[0]}
        }
    }else if(game.x1 !== "undefined" && game.x2 !== "undefined" && game.x3 !== "undefined" && game.y1 !== "undefined" &&
    game.y2 !== "undefined" && game.y3 !== "undefined" && game.z1 !== "undefined" && game.z2 !== "undefined" && game.z3 !== "undefined"){
        return {end:true,winner:"draw"}
    }

    return {end:false,winner:"undefined"}
}

async function registerUser(req,res){
    const prevUser = await isUserPresent(req.body.user)
    if(prevUser.length != 0){
        return res.json({message:"exists"})
    }

    hashedPassword = hashSync(req.body.password,10)

    const newUser = new User({user:req.body.user,password:hashedPassword,name:req.body.name})
    try{
        addedUser = await newUser.save()
        return res.json({user:addedUser.user})
    }catch(e){
        return res.json(e)
    }
}

async function login(req,res){
    const prevUser = await isUserPresent(req.body.user)
    if(prevUser.length == 0){
        return res.json({message:"not exists"})
    }

    const user = prevUser[0].user
    const password = prevUser[0].password
        if(!compareSync(req.body.password,password)){
            return res.json({message:"Incorrect Password"})
        }

        const payload = {
            user: user
        }

        const token = jwt.sign(payload,"SecretKey123!@#", { expiresIn : "7d"})

        res.status(200).json({
            message: "Logged In successfully",
            token: token,
            user:user
        })

}

function getDate(){
    const options = {
        year: 'numeric', month: 'long', day: 'numeric', 
        hour: 'numeric', minute: 'numeric', hour12: true 
      };
      const date = new Date();
      const formattedDate = new Intl.DateTimeFormat('en-US', options,'Asia/Kolkata').format(date);
      return formattedDate
}

async function createGame(users){

    const curTime = getDate()

    const gameData = {
        users:[users.user1,users.user2],
        starter:users.user1,
        winner:"undefined",
        turn:users.user1,
        x1:"undefined",
        x2:"undefined",
        x3:"undefined",
        y1:"undefined",
        y2:"undefined",
        y3:"undefined",
        z1:"undefined",
        z2:"undefined",
        z3:"undefined",
        end:false,
        time:curTime
    }
    console.log(curTime)
    const game = new Game(gameData)

    try{
        const newGame = game.save();
        return newGame
    }catch(e){
        return e
    }
}

async function playGame(req,res){
    const user1 = req.body.user1;
    const user2 = req.body.user2;
    console.log(user1+" "+user2)
    const isuser2 = await isUserPresent(user2)
    console.log(isuser2)
    if(isuser2.length == 0 || user1 === user2){
        return res.json({message:"not exist"})
    }

    const pastGame = await isGamePresent({user1,user2})
    
    if(pastGame.length === 0){
        const newGame = await createGame({user1,user2})
        return res.json({message:"exist",game:newGame})
    }

    return res.json({message:"exist",game:pastGame})
}

async function playMove(req,res){
    // id, game
    const curTime = getDate()
    const status = gameStatus(req.body)
    req.body.winner = status.winner
    req.body.end = status.end
    req.body.time = curTime
    try{
        const updateGame = await Game.findByIdAndUpdate({_id:req.body._id},req.body,{new:true})
        return res.json(updateGame)
    }catch(e){
        return res.json(e)
    }
}

async function userGames(req,res){
    const user = req.body.user;
    try{
        const games = await Game.find({users:{$all:[user]}})
        res.json(games)
    }catch(e){
        res.json(e)
    }
}


module.exports = {playMove,playGame,userGames,registerUser,login,deleteGame}