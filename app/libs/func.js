'use strict'
const fetch = require('node-fetch');
const Ws = use('Ws')
const Amarithcafe = use('./amarithcafe')
const Redis = use('Redis');
const { getDate, addDays, parseISO } = require("date-fns");
module.exports = {

    async registration(cards) {

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
            .then(res => res.json())
            //.then(json => console.log(json))
            .catch(erro => erro);

    },
    async validation(id, username) {
        console.log('validadtion')
        let cont = 0;
        let time = setInterval(async () => {
            console.log('esperando token')
            await Redis.exists(id + 'token', (err, token) => {
                console.log(token)
                cont++;
                if (token == 1) {
                    console.log('entrei  n o token')
                    clearInterval(time);
                    cont = 0;
                    Redis.get(id + 'token', (err, token) => {
                        console.log(' entei no amarithcafe')
                        Amarithcafe.cardValidation(id, username, token)
                        Redis.del(id + 'token');
                    })

                }
                if (cont == 16) {
                    console.log('entrei n o cont 16')

                    cont = 0;
                    const token = {
                        "id": id,
                        "redis": true,
                        "googlekey": "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
                        "pageurl": "https://amarithcafe.revelup.com",
                        "site": {
                            "name": "twocaptcha",
                            "api": "e262288cabf75ce03e50c90de3c6db9c"
                        }
                    }
                    console.log('pegar novo  captcha')
                    this.captcha(token)

                }

            });

        }, 5000);
    },
    async verificarbanco(id) {
        let dados = {
            id: id
        }
        return await fetch('http://cards:3332/verificarbanco', {
            method: 'post',
            body: JSON.stringify(dados),
            headers: { 'Content-Type': 'application/json' },
        })
            .then(result => result.json())
            .catch(erro => {
                console.log(erro.message)
            });
    },
    async Pickup_time() {
        let day = new Date().getDay();
        let dd = new Date().toISOString().replace(/\.\d{3}Z$/, '').split('T');
        let ff = parseISO(dd[0] + 'T15:45:00')
        let pickup_time = ff.toISOString().replace(/\.\d{3}Z$/, '');
        let create_date = new Date().toISOString().replace(/\.\d{3}Z$/, '');

        if (day == 6 || day == 7) {
            let d = new Date().toISOString().replace(/\.\d{3}Z$/, '').split('T');
            let f = parseISO(d[0] + 'T15:45:00')
            let t = addDays(f, 3)
            pickup_time = t.toISOString().replace(/\.\d{3}Z$/, '');

        }
        return { pickup_time: pickup_time, create_date: create_date }
    }

}
/*
 setTimeout(() => {

                    Redis.smembers(id + 'listduplicadosvalidos', (err, cards) => {
                        const Topic = Ws.getChannel('users:*').topic('users:' + id)
                        for (const card of cards) {
                            let msg = '<a href="#">' + card + '  </a> <span class="label label-sm label-success">JÁ FOI TESTADO</span>'
                            if (Topic) {
                                Topic.broadcastToAll('listaprovados', msg)
                                Topic.broadcastToAll('testados', 1)
                                Topic.broadcastToAll('aprovados', 1)
                            }
                        }
                    });
                    Redis.smembers(id + 'listduplicadosinvalidos', (err, cards) => {
                        const Topic = Ws.getChannel('users:*').topic('users:' + id)
                        for (const card of cards) {

                            let msg = '<a href="#">' + card + '  </a><span class="label label-sm label-danger">NEGADO</span> <span class="label label-sm label-info">ELPATRON</span>'
                            if (Topic) {
                                Topic.broadcastToAll('listreprovados', msg)
                                Topic.broadcastToAll('testados', 1)
                                Topic.broadcastToAll('reprovados', 1)
                            }
                        }
                    });

                }, 5000);

*/