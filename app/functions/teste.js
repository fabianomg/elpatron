'use strict'
const Cache = require('adonis-cache')
module.exports = {
    static  teste() {
        let c =  Cache.forget('user_id:552#card#card_id:0')
        console.log(JSON.parse(c))
        return c
    }

}