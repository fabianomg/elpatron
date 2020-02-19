'use strict'
const Ws = use('Ws')
const C = require('../../class/GetCaptcha.class');
const ID = require('./VadateCardController');
const User = use('App/Models/User')
const Cache = use('Cache')
const Redis = use('Redis')
var { isAfter, parseISO, format } = require('date-fns')
const moment = require('moment')
class BotController {
    constructor(taskRestart) {
        this.taskRestart = taskRestart
    }

    async  start({ auth, request, session, response }) {
        // esse trexo verificar se o textarea está vazio


        let textarea = request.input('txtstart')
        if (!textarea) {
            session.flash({
                notification: {
                    type: 'warning',
                    message: 'campo vazio ' + auth.user.username + ', você precisa digitar ou colar seus cartões no campo abaixo para poder iniciar a validação'
                }
            })
            return response.redirect('back')

        }
        // esse trexo de código verificai padrão dos cartões digitados
        let texto = await request.only('txtstart')
        let texto2 = texto.txtstart.split("\r\n")
        for (const item of texto2) {
            var regex = /\d{16}[ |]\d{2}[ |]\d{4}[ |]\d{3}/g.exec(item);

            if (!regex) {
                session.flash({
                    notification: {
                        type: 'warning',
                        message: 'o cartão "' + item + '" está com padrão incorreto, o padrão de cartões aceitos dever ser igual há => "000000000000000|00|0000|000" se for diferente o sistema não procederá com a analise, verifique o padrão dos cartões digitados ou colados. #'
                    }
                })
                return response.redirect('back')
            }
        }

        // apagar qualquer vestigio do usuário
        await Redis.keys('*', async (error, result) => {
            if (error) {
                console.log(error);
                throw error;
            }
            for (let index = 0; index < result.length; index++) {
                let t = await result[index]
                let i = await t.indexOf("user_id:" + auth.user.id + "#")

                if (i != -1) {
                    await Redis.del(result[index]);
                }
            }
        });


        // para garanti que não vai ficar nenhum vestigio do usuario essa fucntion é execultada
        await this.resetCache(auth.user.id);
        // essa variavel vai guardar os cartões resolvidos la no metodo Validate do 'VadateCardController'
        await Cache.forever('user_id:' + auth.user.id + '#resolvecards#', 0)

        await Cache.forever('user_id:' + auth.user.id + '#aprovadas#', 0)
        await Cache.forever('user_id:' + auth.user.id + '#reprovadas#', 0)
        await Cache.forever('user_id:' + auth.user.id + '#recusadas#', 0)
        await Cache.forever('user_id:' + auth.user.id + '#testadas#', 0)

        const status = await Ws.getChannel('status:*').topic('status:s' + auth.user.id)
        const carregadas = await Ws.getChannel('status:*').topic('status:c' + auth.user.id)
        const start = await Ws.getChannel('status:*').topic('status:st' + auth.user.id)
        const stop = await Ws.getChannel('status:*').topic('status:stop' + auth.user.id)
        const expired = await Ws.getChannel('status:*').topic('status:cex_te' + auth.user.id)

        if (status) {
            status.broadcastToAll('message', { s: 'start', msg: 'Processando dados...' })
        }
        if (start) {
            start.broadcastToAll('message', true)
        }
        if (stop) {
            stop.broadcastToAll('message', false)
        }

        try {

            let txt = await request.only('txtstart')
            let tt = txt.txtstart.split("\r\n")
            let cont = 0

            for (const items of tt) {

                let t = items.split("|")
                let arr = {
                    user_id: auth.user.id,
                    n: t[0].trim(),
                    m: t[1].trim(),
                    a: t[2].substr(2, 2),
                    v: Math.floor(Math.random() * (999 - 100 + 1)) + 100,
                    aa: t[2],
                    vv: t[3],
                }
                await Cache.forever('user_id:' + auth.user.id + '#card#' + 'card_id:' + cont, JSON.stringify(arr))

                cont++;
                await Cache.increment('user_id:' + auth.user.id + '#contadorcard#')
            }

            if (carregadas) {
                await carregadas.broadcastToAll('message', cont)
            }


        } catch (error) {
            console.log(error.message);
        }

        if (!await Cache.has('user_id:' + auth.user.id + '#restart#')) {


            const c = new C();
            await c.GetCaptcha(auth.user.id);

            const validator = new ID()
            await validator.GetId(auth.user.id);

        }

        this.taskRestart = setInterval(async () => {

            const use = await User.find(auth.user.id)
            if (use.balance == 0) {

                await Cache.forever('user_id:' + auth.user.id + '#restart#', 0)
                if (status) {
                    await status.broadcastToAll('message', { s: 'end', msg: 'Sem Créditos!!...' })

                }
                if (start) {
                    start.broadcastToAll('message', false)
                }
                if (stop) {
                    stop.broadcastToAll('message', true)
                }
                if (expired) {
                    expired.broadcastToAll('message', { pro: auth.user.username + ' você está "SEM CRÉDITO"', msg: 'seus créditos acabaram, favor entre em contato com o administrador do sistema para obter mais créditos!' })
                }
                clearInterval(this.taskRestart)

                console.log('Terminado........')
                return

            }
            if (await Cache.get('user_id:' + auth.user.id + '#resolvecards#') == await Cache.get('user_id:' + auth.user.id + '#contadorcard#')) {
                clearInterval(this.taskRestart)
                await Cache.forever('user_id:' + auth.user.id + '#restart#', 0)
                if (status) {
                    await status.broadcastToAll('message', { s: 'end', msg: 'Processamento OK!!...' })

                }
                if (start) {
                    start.broadcastToAll('message', false)
                }
                if (stop) {
                    stop.broadcastToAll('message', true)
                }
                if (expired) {
                    expired.broadcastToAll('message', { pro: auth.user.username + ' PROCESSO CONCLUIDO!!', msg: ' o processo de validação dos cartões foi concluido com sucesso!' })
                }
                //deletar todos  os cartoes referente ao user
                await this.resetCache(auth.user.id);
                console.log('Terminado........')
                return

            }
            let restart = await Cache.get('user_id:' + auth.user.id + '#restart#')
            if (restart == 1) {
                await Cache.forever('user_id:' + auth.user.id + '#restart#', 0)
                await this.restart(auth.user.id);
            }


        }, 5000);



    }
    async restart(id) {
        const cc = new C();
        await cc.GetCaptcha(id);
        const validatorr = new ID()
        await validatorr.GetId(id);
    }
    async resetCache(id) {
        await Cache.forget('user_id:' + id + '#restart#')
        await Cache.forget('user_id:' + id + '#resolvecards#')

        await Cache.forget('user_id:' + id + '#aprovadas#')
        await Cache.forget('user_id:' + id + '#reprovadas#')
        await Cache.forget('user_id:' + id + '#recusadas#')
        await Cache.forget('user_id:' + id + '#testadas#')
        await Cache.forget('user_id:' + id + '#campos_form#state#')
        await Cache.forget('user_id:' + id + '#campos_form#generator#')
        await Cache.forget('user_id:' + id + '#campos_form#validation#')
        await Cache.forget('user_id:' + id + '#codigo_url#')
        await Cache.forget('user_id:' + id + '#contadorcard#')
    }
    async stop({ auth }) {
        const status = await Ws.getChannel('status:*').topic('status:s' + auth.user.id)
        const start = await Ws.getChannel('status:*').topic('status:st' + auth.user.id)
        const stop = await Ws.getChannel('status:*').topic('status:stop' + auth.user.id)
        const carregadas = await Ws.getChannel('status:*').topic('status:c' + auth.user.id)
        const aprovadas = await Ws.getChannel('status:*').topic('status:a' + auth.user.id)
        const reprovadas = await Ws.getChannel('status:*').topic('status:r' + auth.user.id)
        const testadas = await Ws.getChannel('status:*').topic('status:t' + auth.user.id)

        clearInterval(this.taskRestart)
        await Cache.forever('user_id:' + auth.user.id + '#restart#', 0)
        if (status) {
            await status.broadcastToAll('message', { s: 'end', msg: 'Processamento Parado!!...' })
        }

        if (start) {
            start.broadcastToAll('message', false)
        }
        if (stop) {
            stop.broadcastToAll('message', true)
        }
        if (carregadas) {
            await carregadas.broadcastToAll('message', '0')
        }
        if (aprovadas) {
            await aprovadas.broadcastToAll('message', '0')
        }
        if (reprovadas) {
            await reprovadas.broadcastToAll('message', '0')
        }
        if (testadas) {
            await testadas.broadcastToAll('message', '0')
        }

        //deletar todos  os cartoes referente ao user
        await this.resetCache(auth.user.id);
        console.log('Terminado........')

        // apagar qualquer vestigio do usuário
        await Redis.keys('*', async (error, result) => {
            if (error) {
                console.log(error);
                throw error;
            }
            for (let index = 0; index < result.length; index++) {
                let t = await result[index]
                let i = await t.indexOf("user_id:" + auth.user.id)
                console.log(i)

                if (i != -1) {
                    await Redis.del(result[index]);
                }
            }
        });

    }
}

module.exports = BotController
