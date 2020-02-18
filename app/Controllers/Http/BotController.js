'use strict'
const Ws = use('Ws')
const C = require('../../class/GetCaptcha.class');
const ID = require('./VadateCardController');
const User = use('App/Models/User')
const Card = use('App/Models/Card')
const Database = use('Database')
const Cache = use('Cache')
const Redis = use('Redis')
var { isAfter, parseISO, format } = require('date-fns')
const moment = require('moment')
class BotController {

    async  start({ auth, request }) {

        const use = await User.find(auth.user.id)

        let data = new Date().toISOString().replace(/\.\d{3}Z$/, '')

        let str = use.end.replace(/\//gm, "-");// (\/)(\s[-]\s)
        let ddd = str.replace(/(\s[-]\s)/, "T")
        let dy = ddd.replace("h", ":");
        let datet = moment(dy).toISOString();
        //let hou = moment(dy.toISOString()).format('MMMM Do YYYY, h:mm:ss a');
        var result = isAfter(dy, data)

        console.log(dy)
        console.log(result)
        console.log(data)

        return


        await Redis.keys('*', async (error, result) => {
            if (error) {
                console.log(error);
                throw error;
            }
            for (let index = 0; index < result.length; index++) {
                let t = await result[index]
                let i = await t.indexOf("user_id:" + auth.user.id + "#")

                if (i == -1) {
                    await Redis.del(result[index]);
                }
            }
        });



        await this.resetCache(auth.user.id);
        // essa variavel vai guardar os cartões resolvidos la no metodo Validat do 'VadateCardController'
        await Cache.forever('user_id:' + auth.user.id + '#resolvecards#', 0)

        await Cache.forever('user_id:' + auth.user.id + '#aprovadas#', 0)
        await Cache.forever('user_id:' + auth.user.id + '#reprovadas#', 0)
        await Cache.forever('user_id:' + auth.user.id + '#recusadas#', 0)
        await Cache.forever('user_id:' + auth.user.id + '#testadas#', 0)

        const status = await Ws.getChannel('status:*').topic('status:s' + auth.user.id)
        const carregadas = await Ws.getChannel('status:*').topic('status:c' + auth.user.id)
        const start = await Ws.getChannel('status:*').topic('status:st' + auth.user.id)
        const stop = await Ws.getChannel('status:*').topic('status:stop' + auth.user.id)

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

        let taskRestart = setInterval(async () => {

            if (await Cache.get('user_id:' + auth.user.id + '#resolvecards#') == await Cache.get('user_id:' + auth.user.id + '#contadorcard#')) {
                clearInterval(taskRestart)
                await Cache.forever('user_id:' + auth.user.id + '#restart#', 0)
                await status.broadcastToAll('message', { s: 'end', msg: 'Processamento OK!!...' })
                if (start) {
                    start.broadcastToAll('message', false)
                }
                if (stop) {
                    stop.broadcastToAll('message', true)
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
}

module.exports = BotController
