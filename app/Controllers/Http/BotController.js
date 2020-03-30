'use strict'
const Ws = use('Ws')
const User = use('App/Models/User')
const Cache = use('Cache')
const Redis = use('Redis')
const Database = use('Database')
var { isAfter, parseISO, format } = require('date-fns')
const amqp = require('amqplib/callback_api');
const url = "amqp://rabbitmq:rabbitmq@rabbit1:5672/"
const moment = require('moment')
const Func = require('../../libs/func')
const fetch = require('node-fetch');
class BotController {

    async  start({ auth, request, session, response }) {


        
      

        //apagar memoria cache
        await Redis.del(auth.user.id + 'listduplicadosinvalidos');
        await Redis.del(auth.user.id + 'listduplicadosvalidos');
        await Redis.del(auth.user.id + 'listcards');
        await Redis.del(auth.user.id + 'stop');

       

       
        //colocar os cards no cache redis
        await Redis.rpush(auth.user.id + 'listcards', cards);

        ///muda o status
       
        //verificar cards no banco
        let res = await Func.verificarbanco(auth.user.id);

        //verificar lista de cards
        setTimeout(async () => {

            if (res == 'cards verificados') {
                let t = await Redis.exists(auth.user.id + 'listcards', async (err, result) => {

                    if (result == 1) {
                        console.log('entrei no cards veridficados BOT')
                        await Redis.lrange(auth.user.id + 'listcards', 0, -1, async (err, total) => {
                            console.log('total: ' + total.length)
                            if (Topic) {
                                await Topic.broadcastToAll('total', total.length)
                            }
                        })
                        const token = {
                            "id": auth.user.id,
                            "redis": true,
                            "googlekey": "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
                            "pageurl": "https://amarithcafe.revelup.com",
                            "site": {
                                "name": "twocaptcha",
                                "api": "e262288cabf75ce03e50c90de3c6db9c"
                            }
                        }
                        if (Topic) {
                            await Topic.broadcastToAll('atividade', 'estamos processando aguarde....')
                        }
                        console.log('entra n o captcha')
                        Func.captcha(token)
                        console.log('entra n o validation')
                        Func.validation(auth.user.id, auth.user.username);

                    } else {

                        // const Topic = await Ws.getChannel('users:*').topic('users:' + auth.user.id)
                        if (Topic) {
                            await Topic.broadcastToAll('status', 'Aguardando...')
                            if (Topic) {
                                await Topic.broadcastToAll('atividade', 'Processo finalizado com sucesso!!')
                            }
                        }
                    }
                });
            }

        }, 500);

        setTimeout(async () => {
            await Redis.exists(auth.user.id + 'listduplicadosinvalidos', async (err, result) => {

                if (result == 1) {
                    await Redis.smembers(auth.user.id + 'listduplicadosinvalidos', async (err, result) => {
                        if (Topic) {
                            await Topic.broadcastToAll('total', result.length)
                        }
                        for (const card of result) {
                            let aprov = '<a href="#">' + card + '  </a><span class="label label-sm label-danger">NEGADO</span><span class="label label-sm label-info">ELPATRON</span>'
                            if (Topic) {
                                await Topic.broadcastToAll('listreprovados', aprov)
                            }
                            if (Topic) {
                                await Topic.broadcastToAll('reprovados', 1)
                            }
                            if (Topic) {
                                await Topic.broadcastToAll('testados', 1)
                            }
                        }
                    });
                }
            });

            await Redis.exists(auth.user.id + 'listduplicadosvalidos', async (err, result) => {

                if (result == 1) {
                    await Redis.smembers(auth.user.id + 'listduplicadosvalidos', async (err, result) => {
                        if (Topic) {
                            await Topic.broadcastToAll('total', result.length)
                        }
                        for (const card of result) {
                            let aprov = '<a href="#">' + card + '  </a><span class="label label-sm label-success">JÁ FOI TESTADO</span>'
                            if (Topic) {
                                await Topic.broadcastToAll('listaprovados', aprov)
                            }
                            if (Topic) {
                                await Topic.broadcastToAll('aprovados', 1)
                            }
                            if (Topic) {
                                await Topic.broadcastToAll('testados', 1)
                            }
                        }
                    });
                }
            });
        }, 1000);


        //6514867262787880|06|2023|000
        // 6524867262787880|06|2023|000
        //6544867262787880|06|2023|000
        //6564867262787880|06|2023|000
        //6500867262787880|06|2023|000
        //6504967262787880|06|2023|000
        // 6505867262787880|06|2023|000
        //6504877262787880|06|2023|000
        //6504897262787880|06|2023|000
        //6504867262087880|06|2023|000
        //6504867262707880|06|2023|000
        // 6504867262780880|06|2023|000
        //6504867262787080|06|2023|000
        //6504867262787800|06|2023|000
        //6504867262787800|06|2023|000


        const deathbycaptcha = await Database.from('captchas').where('name', 'deathbycaptcha')
        const twocaptcha = await Database.from('captchas').where('name', 'twocaptcha')
    }
}

module.exports = BotController