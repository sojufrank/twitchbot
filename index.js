require('dotenv').config()
const tmi = require('tmi.js')
const fetch = require('node-fetch')



//test globals
let monsterCurrentHitPointsValue = 20
let playerCurrentHitPointsValue = 20

const model = {
    options: {
        options: {
            debug: true
        },
        connection: {
            cluster: 'aws',
            reconnect: true
        },
        identity: {
            username: 'sojupotato',
            password: process.env.API_KEY
        },
        channels: ['sojustream']
    },
    myData: {
        bio: `name:Soju; class:waifu; age:38; gender:female; location:seattle; weight:170; height:5'10; shoesize:10; likes:chocobos;`,
        schedule: 'I try to stream on evenings in USA pacific timezone.',
        app: 'mbapp v2. with looper:  https://drive.google.com/file/d/14AXMXFVsKv-K63c5RKNrY_uDqqV5zszL/view?usp=sharing',
        mb: 'link to mb video: https://youtu.be/bwfA4vcBTY4',
        login: 'link to mb login script video: https://youtu.be/ebtH1DpI51M',
        discord: 'link to discord: https://discord.com/invite/4BrqNgvcAm',
        twitter: 'https://twitter.com/sojusecret',
        donation: 'https://streamlabs.com/sojustream/tip',
    },
    userQuotes: {
        soju: 'soju loves you <3',
        memez: 'We believe in Memez!',
        harb: 'harb loves you <3',
        nel: '!cybor xD',
        chewy: 'Chewy has big D',
        zoopy: 'i am zoop.',
        wiseguy: 'LUL cant really think of anything atm',
        dark: 'libbia Rocks',
        lop: 'something allong the lines of ninja looting your ACDC :p',
    },
    streamers: {
        datgsguy: 'link to datgsguy\'s twitch channel: https://www.twitch.tv/datgsguy',
        caloss: 'link to caloss\'s twitch channel: https://www.twitch.tv/caloss2',
        maj: 'link to maj\'s twitch channel: https://www.twitch.tv/myownprincess',
        beta: 'link to beta\'s twitch channel: https://www.twitch.tv/betaoptixgaming',
        roctz: 'link to roctz\'s twitch channel: https://www.twitch.tv/roctz',
        douky: 'link to douky\'s twitch channel: https://www.twitch.tv/douky234',
        glitchy: 'link to glitchygirl\'s twitch channel: https://www.twitch.tv/glitchygirl',
        destru: 'link to destru\'s twitch channel: https://www.twitch.tv/notdestru',
    },
    attacks:{
        fling:{},
        burst:{},
        fullauto:{},
        aimedshot:{},
        fastattack:{},
        brawl:{},
        dimach:{},
        sneakattack:{},
    }
}

const intervalController = {
    init: (c) => {
        intervalController.streamAnnouncementHourly(c)
        //intervalController.streamAnnouncementTest(c)
    },
    streamAnnouncementHourly: (client) => {
        setInterval(() => {
            client.color('HotPink')
            client.action('sojustream', `Welcome to my stream. Here are my bot commands to get to know me.`)
            client.action('sojustream', `!${Object.keys(model.myData).join(' | !')}`)
        }, 7200000)
    },
    streamAnnouncementTest: (client) => {
        setInterval(() => {
            client.color('HotPink')
            client.action('sojustream', `Welcome to my stream. Here are my bot commands to get to know me.`)
            client.action('sojustream', `!${Object.keys(model.myData).join(' | !')}`)
        }, 5000)
    }
}

const botClientController = {
    init: (args) => {
        const botClient = new tmi.client(args)
        botClient.connect()

        botClient.on('connected', (address, port) => {
            botClient.color('DodgerBlue')
            botClient.action('sojustream', 'Hi chat, Potatobot has joined the chat.')
        })
        botClientController.chatCommandParse(botClient)
        intervalController.init(botClient)
        raffleController.init()
    },
    chatCommandParse: (client) => {
        client.on('chat', (channel, user, message, self) => {
            if (message.substring(0, 1) === '!') {
                const messageArray = message.split(' ')
                if (messageArray[0].substring(1) in model.userQuotes) {
                    client.color('OrangeRed')
                    client.action('sojustream', `${model.userQuotes[messageArray[0].substring(1)]}`)
                } else if (messageArray[0].substring(1) in model.myData) {
                    client.color('HotPink')
                    client.action('sojustream', `${model.myData[messageArray[0].substring(1)]}`)
                } else if (messageArray[0].substring(1) in model.streamers) {
                    client.color('GoldenRod')
                    client.action('sojustream', `${model.streamers[messageArray[0].substring(1)]}`)
                } else if (messageArray[0].substring(1) === 'raffle') {
                    client.color('BlueViolet')
                    raffleController.raffleParse(user, message, client)
                }
            }
        })
    },
}

const raffleController = {
    init: () => {
        this.resetRaffle = raffleController.resetRaffle()
    },
    raffleParse: (user, message, client) => {
        const messageArray = message.split(' ')
        if (messageArray[1] === 'start' && this.raffleLock === true) {
            this.raffleLock = false
            if(messageArray.length > 2){
                let tempMessage = []
                for(i=2;i<messageArray.length;i++){
                    tempMessage.push(messageArray[i])
                }
                client.action('sojustream', `RAFFLE has started for ${tempMessage.join(' ')}. Join the raffle by typing !raffle join.`)
            } else {
                client.action('sojustream', `Raffle has started for Items.`)
            }
        } else if (messageArray[1] === 'join' && this.raffleLock === false) {
            console.log(user)
            if(this.raffleUniqueSet.has(user.username)){
                client.action('sojustream', `${user.username} has already joined the raffle.`)
            } else {
                this.raffleUniqueSet.add(user.username)
                client.action('sojustream', `${user.username} has entered the raffle.  ${this.raffleUniqueSet.size} users joined the raffle`)
            }
        } else if (messageArray[1] === 'end' && this.raffleLock === false) {
            const randNum = raffleController.randomNumber(0,this.raffleUniqueSet.size - 1)
            const randArray = Array.from(this.raffleUniqueSet)
            client.action('sojustream', `Raffle winner is  <||${randArray[randNum]}||> gz!
             ${this.raffleUniqueSet.size} users joined the raffle.`)
             raffleController.resetRaffle()
        }
    },
    resetRaffle:()=>{
        this.raffleLock = true
        this.raffleUniqueSet = new Set()
        this.item = ""
    },
    randomNumber:(min, max)=>{
        min = Math.ceil(min);
        max = Math.floor(max);
        return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
    }
}

const lootController = {
    init:()=>{},

}

const gameController = {
    init:()=>{
        this.state = 'stop'
        this.round = 1
        this.players = []
        this.monsters = []

        const a = 1
        const b = 2
        this.soju = a+b
    },
    firstMethod:()=>{
        ()=>{}
    }
    //player
    //boss
    //round
    // when join auto attacks each round
    //round is 60 seconds
    //potential phases
    //attack phase, loot phase, 
}

botClientController.init(model.options)
gameController.init()
gameController.firstMethod()

// const client = new tmi.client(model.options)

// client.connect()

// client.on('connected', (address, port) => {
//     client.action('sojustream', 'Hi chat, Potatobot has joined the chat.')
// })

// client.on('chat', (channel, user, message, self) => {
//     //test

//     // if(message === '!soju'){
//     //     client.action('sojustream', 'soju')
//     // }

//     if (message === '!raffle start' && raffleLock === true) {
//         raffleLock = false
//         client.action('sojustream', 'RAFFLE STARTED!')
//     }

//     if (message === '!raffle join' && raffleLock === false) {
//         //user.username
//         //raffleArray.push(user.username)
//         if(raffleUniqueSet.has(user.username)){
//             client.action('sojustream', `${user.username} has already joined the raffle.`)
//         } else {
//             raffleUniqueSet.add(user.username)
//             client.action('sojustream', `${user.username} has entered the raffle.  ${raffleUniqueSet.size} users have entered the raffle.`)
//         }

//     }

//     if (message === '!raffle end' && raffleLock === false) {
//         function getRandomInt(min, max) {
//             min = Math.ceil(min);
//             max = Math.floor(max);
//             return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
//           }

//         const randNum = getRandomInt(0,raffleUniqueSet.size - 1)

//         const randArray = Array.from(raffleUniqueSet)

//         client.action('sojustream', `Winner is ${randArray[randNum]}`)

//         raffleUniqueSet = new Set()
//         raffleLock = true
//     }



//     if(message.substring(0,1) === '!'){
//         //client.action('sojustream', '!!! exclamation point detected')

//         const messageArray = message.split(' ')
//         //client.action('sojustream', `!!! exclamation point detected ${messageArray[0]}`)


//         if (messageArray[0] === '!fling') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 1
//             client.action('sojustream', `${user.username} attacked beast with fling doing 1 projectile damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//             beastAttackPlayer()
//         }
//         else if (messageArray[0] === '!burst') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 3
//             client.action('sojustream', `${user.username} attacked beast with burst doing 3 projectile damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//             beastAttackPlayer()
//         }
//         else if (messageArray[0] === '!fullauto') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 15
//             client.action('sojustream', `${user.username} attacked beast with full auto doing 15 projectile damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//             beastAttackPlayer()
//         } else if (messageArray[0] === '!aimedshot') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 5
//             client.action('sojustream', `${user.username} attacked beast with aimedshot doing 5 projectile damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//             beastAttackPlayer()
//         }else if (messageArray[0] === '!fastattack') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 1
//             client.action('sojustream', `${user.username} attacked beast with brawl doing 1 melee damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//             beastAttackPlayer()
//         } else if (messageArray[0] === '!brawl') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 2
//             client.action('sojustream', `${user.username} attacked beast with brawl doing 2 melee damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//         } else if (messageArray[0] === '!sneakattack') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 5
//             client.action('sojustream', `${user.username} attacked beast with sneak attack doing 5 melee damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//         } else if (messageArray[0] === '!backstab') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 7
//             client.action('sojustream', `${user.username} attacked beast with backstab doing 5 melee damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//         } else if (messageArray[0] === '!dimach') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 15000
//             client.action('sojustream', `${user.username} attacked beast with dimach doing 15000 melee damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//         } else if (messageArray[0] === '!candycane') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - 7
//             client.action('sojustream', `${user.username} attacked beast with candycane doing 7 rainbow damage, ${getMonsterHitPoints()}. ${monsterDeathCheck()}`)
//         } else if (messageArray[0] === '!hug') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue + 1
//             client.action('sojustream', `${user.username} gives beast a hug healing for 1 hp, ${getMonsterHitPoints()}.`)
//         } else if (messageArray[0] === '!babylegs') {
//             monsterCurrentHitPointsValue = monsterCurrentHitPointsValue - monsterCurrentHitPointsValue
//             client.action('sojustream', `${user.username} attacked beast in the feels with bodyshame damage, ${getMonsterHitPoints()}.${monsterDeathCheck()}`)
//         }

//         function beastAttackPlayer(){
//             const beastdmg = getRandomInt(1,5)
//             playerCurrentHitPointsValue = playerCurrentHitPointsValue - beastdmg
//             client.action('sojustream', `Beast attacked ${user.username} for ${beastdmg} melee damage, ${getPlayerHitPoints(user.username)}. ${playerDeathCheck(user.username)}`)
//         }

//         function getRandomInt(max) {
//             return Math.floor(Math.random() * Math.floor(max));
//         }

//         function getRandomInt(min, max) {
//             min = Math.ceil(min);
//             max = Math.floor(max);
//             return Math.floor(Math.random() * (max - min) + min); //The maximum is exclusive and the minimum is inclusive
//           }

//         function getMonsterHitPoints(){
//             if(monsterCurrentHitPointsValue <= 0){
//                 return 'beast has 0 HP remaining'
//             } else {
//                 return `beast has ${monsterCurrentHitPointsValue} HP remaining`
//             }
//         }

//         function getPlayerHitPoints(name){
//             if( playerCurrentHitPointsValue <= 0){
//                 return `${name} has 0 HP remaining`
//             } else {
//                 return `${name} has ${playerCurrentHitPointsValue} HP remaining`
//             }
//         }

//         function monsterDeathCheck(){
//             if(monsterCurrentHitPointsValue <= 0){
//                 monsterCurrentHitPointsValue = 20
//                 playerCurrentHitPointsValue = 20
//                 return `BEAST IS DEAD! You found a ${loot()} on the remains. restarting game.`
//             } else {
//                 return ""
//             }
//         }

//         function playerDeathCheck(name){
//             if(playerCurrentHitPointsValue <= 0){
//                 monsterCurrentHitPointsValue = 20
//                 playerCurrentHitPointsValue = 20
//                 return `${name} IS DEAD! Restarting game.`
//             } else {
//                 return ""
//             }
//         }

//         function loot(){

//             function getRandomInt(max) {
//                 return Math.floor(Math.random() * Math.floor(max));
//             }

//             const lootArray = ['Burden of Competence','Greaves of Malfeasance','Shoulderplates of Sabotage',
//             'Cuirass of Obstinacy', 'Gauntlets of Deformation', 'Boots of Concourse'
//             ]

//             return lootArray[getRandomInt(lootArray.length -1)]
//         }
//     } 