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
const Queue = require('../../libs/queue')
const Eventsqueue = require('../../libs/eventQueue')
const fetch = require('node-fetch');
class BotController {

    async  start({ auth, request, session, response }) {
        // aciona a escuta d menssagem
        Eventsqueue.listentoqueues(auth.user.id)

        // Queue.sendToQueue(false, auth.user.id, { type: 'aprovado', msg: 'aprovado' })


        //Func.deletecards({ userID: auth.user.id })
        // apagar todos cartoes da lista

        await Redis.del(auth.user.id + 'listcardsreprovados');
        await Redis.del(auth.user.id + 'listcardsaprovados');
        await Redis.del(auth.user.id + 'listcards');
        /*
               Queue.consume(false, auth.user.id + '#' + auth.user.username, async (message) => {
                   const Topic = await Ws.getChannel('user:*').topic('user:' + auth.user.id)
                   let result = await JSON.parse(message.content.toString());
       
       
                   if (message && Topic) {
                       await Topic.broadcastToAll('message', { type: result.type, msg: result.msg })
                   }
       
               })
              
               Queue.consume(false, auth.user.id + '#' + auth.user.username + '#status', async (message) => {
                
               const Topic = await Ws.getChannel('users:*').topic('users:' + auth.user.id)
               
                   let result = await JSON.parse(message.content.toString());
                   let balance2;
                   if (result.msg == 'valid') {
                       const credd = await User.find(auth.user.id)
                       let cr = credd.balance.split(' ')
                       let h = credd.balance.indexOf('h')
                       if (h == -1) {
                           let saldo = parseInt(cr[0]) - 1
                           balance2 = saldo + ' ' + cr[1] + ' ' + cr[2] + ' ' + cr[3] + ' ' + cr[4] + ' ' + cr[5]
       
                           await Database
                               .table('users')
                               .where('id', auth.user.id)
                               .update({ balance: balance2 })
                       }
                       if (Topic) {
                           await Topic.broadcastToAll('message', { type: 'saldo', msg: balance2 })
                       }
                       if (cr[0].balance == 0) {
       
                       }
                   }
                   if (message && Topic) {
                       await Topic.broadcastToAll('message', { type: result.type, msg: result.msg })
                   }
       
               })
       */
        let cards = []
        let textarea = request.input('txtstart')
        if (!textarea) {
            session.flash({
                notification: {
                    type: 'warning',
                    message: 'campo vazio ' + auth.user.username + ', você precisa inseri no mínimo 5 cartões no campo abaixo para poder iniciar a validação'
                }
            })
            return response.redirect('back')

        }
        // esse trexo de código verificai padrão dos cartões digitados
        let texto = await request.only('txtstart')
        let texto2 = texto.txtstart.split("\r\n")
        for (const item of texto2) {
            let fistnumber = item.substr(0, 1);
            if (fistnumber != 6) {
                session.flash({
                    notification: {
                        type: 'warning',
                        message: 'o cartão "' + item + '" começa com o número ' + fistnumber + ', apenas cartões iniciados com o numero 6 são aceitos, por favor reveja sua lista de cartões'
                    }
                })
                return response.redirect('back')
            }
            var regex = /\d{16}[ |]\d{2}[ |]\d{4}[ |]\d{3}/g.exec(item);

            if (!regex) {
                session.flash({
                    notification: {
                        type: 'warning',
                        message: 'o cartão "' + item + '" está com padrão incorreto, o padrão de cartões aceitos dever ser igual há => "000000000000000|00|0000|000" se for diferente o sistema não procederá com a analise, verifique o padrão dos cartões da sua lista, ex: número do cartão 16 digitos, mês 2 digitos, ano 4 digitos, sempre seguindo o padrão informado.'
                    }
                })
                return response.redirect('back')
            }
            cards.push(item)
        }

        if (texto2.length < 5) {
            session.flash({
                notification: {
                    type: 'warning',
                    message: 'a quantidade minima de cartões para verificação é 5, por favor reveja sua lista de cartões.'
                }
            })
            return response.redirect('back')
        }

        if (texto2.length > 200) {
            session.flash({
                notification: {
                    type: 'warning',
                    message: 'a quantidade de cartões que pode ser verificada por vez é 200, sua lista está com: ' + texto2.length + ' por favor reveja sua lista.'
                }
            })
            return response.redirect('back')
        }
        //termino da verificação dos cards



        Queue.sendToQueue(false, '#' + auth.user.id + 'total', texto2.length)
        Queue.sendToQueue(false, '#' + auth.user.id + 'status', 'Processando dados...')
        Queue.sendToQueue(false, '#' + auth.user.id + 'atividade', 'Iniciando verificação Aguarde....')
        // colocor os cartoes e cache
        for (let index = 0; index < texto2.length; index++) {
            try {
                Redis.rpush([auth.user.id + 'listcards', texto2[index]]);
            } catch (error) {
                console.log(error.message)
                continue;
            }
        }


        Func.registration({ userID: auth.user.id, owner: auth.user.username, cards })
        ////cadastro ok 
        setTimeout(() => {
            Queue.sendToQueue(false, '#' + auth.user.id + 'atividade', ' Aguarde. processando........')
        }, 1000);

        Queue.consume(false, '#' + auth.user.id + 'verificarcards', async (message) => {
            let result = await JSON.parse(message.content.toString());
            fetch('http://cards:3332/teste', {
                method: 'post',
                body: JSON.stringify({ userID: auth.user.id, owner: auth.user.username }),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res.json())
                .then(cards => {
                    if (cards != '') {
                        const token = {
                            "id": auth.user.id,
                            "rabbitmq": true,
                            "googlekey": "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
                            "pageurl": "https://amarithcafe.revelup.com",
                            "site": {
                                "name": "twocaptcha",
                                "api": "e262288cabf75ce03e50c90de3c6db9c"
                            }
                        }
                        Queue.sendToQueue(false, '#' + auth.user.id + 'atividade', 'Aguardando Captcha ser Resolvido....')
                        Func.captcha(token)
                    } else {
                        Queue.sendToQueue(false, '#' + auth.user.id + 'status', 'Aguardando...')
                        Queue.sendToQueue(false, '#' + auth.user.id + 'atividade', 'Processo finalizado com sucesso!!')
                    }
                });
        })
     

        Func.validation({ id: auth.user.id, username: auth.user.username })

        //6504867262787880|06|2023|000
        // 6504867262787880|06|2023|000
        //6504867262787880|06|2023|000
        //6504867262787880|06|2023|000
        //6504867262787880|06|2023|000

        const deathbycaptcha = await Database.from('captchas').where('name', 'deathbycaptcha')
        const twocaptcha = await Database.from('captchas').where('name', 'twocaptcha')
    }
}

module.exports = BotController