'use strict'
const fetch = require('node-fetch');
const Queue = require('../libs/queue')
module.exports = {

    async registration(cards) {
        Queue.sendToQueue(false, cards.userID + '#verificar#cards', true)
        try {
            await fetch('http://cards:3332/cadastroCards', {
                method: 'post',
                body: JSON.stringify(cards),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res)
                .then(json => json)
                .catch(erro => erro);
            return 'ok'
        } catch (error) {
            return error.message
        }
    },
    async captcha(token) {

        fetch('http://captcha:3331/getToken', {
            method: 'post',
            body: JSON.stringify(token),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res)
            //.then(json => console.log(json))
            .catch(erro => erro);

    },
    async validation(dados) {
        fetch('http://cards:3332/validatecard', {
            method: 'post',
            body: JSON.stringify(dados),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res)
            .then(json => json)
            .catch(erro => erro);
    },
    async deletecards(dados) {
        fetch('http://cards:3332/deletcards', {
            method: 'delete',
            body: JSON.stringify(dados),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(res => res)
            .then(json => json)
            .catch(erro => erro);
    }

}