'use strict'
const Ws = use('Ws')
const C = require('../../class/GetCaptcha.class');
const ID = require('./VadateCardController');
const User = use('App/Models/User')
const Database = use('Database')
const cron = require("node-cron");
class BotController {

    async  start({ auth, request }) {

        const status = await Ws.getChannel('status:*').topic('status:s' + auth.user.id)
        const carregadas = await Ws.getChannel('status:*').topic('status:c' + auth.user.id)

        if (status) {
            status.broadcastToAll('message', { s: 'start', msg: 'Processando dados...' })
        }
    

        /*
                const user = await User.find(auth.user.id)
                await user.load('cards')
                console.log(user.toJSON().cards)
                return
        
        */
        try {

            let txt = await request.only('txtstart')
            let cards = []
            if (txt.txtstart.length > 30) {
                let tt = txt.txtstart.split("\r\n")
                let cont = 0
                for (const items of tt) {
                    let t = items.split("|")
                    /*
                    await cards.push({
                        n: t[0].trim(),
                        m: t[1].trim(),
                        a: t[2].substr(2, 2),
                        v: t[3].trim()
                    })
                    */

                    const userI = await Database
                        .table('cards')
                        .insert({
                            user_id: auth.user.id,
                            n: t[0].trim(),
                            m: t[1].trim(),
                            a: t[2].substr(2, 2),
                            v: Math.floor(Math.random() * (999 - 100 + 1)) + 100
                        })
                    cont++;
                }
                if (carregadas) {
                    carregadas.broadcastToAll('message', cont)
                }
            } else {
                let t = txt.txtstart.split("|")

                /*
                await cards.push({
                    n: t[0].trim(),
                    m: t[1].trim(),
                    a: t[2].substr(2, 2),
                    v: t[3].trim()
                })
                */

                const userI = await Database
                    .table('cards')
                    .insert({
                        user_id: auth.user.id,
                        n: t[0].trim(),
                        m: t[1].trim(),
                        a: t[2].substr(2, 2),
                        v: Math.floor(Math.random() * (999 - 100 + 1)) + 100
                    })
                if (carregadas) {
                    carregadas.broadcastToAll('message', 1)
                }
            }

        } catch (error) {
            console.log(error.message);
        }

        const c = new C();
        const resultCaptcha = await c.GetCaptcha(auth.user.id);
        const validator = new ID()
        const resultValidator = await validator.GetId(auth.user.id);


        let taskRestart = setInterval(async () => {

            let result = await Database
                .table('url_tokens')
                .where('user_id', auth.user.id)
                .first()
            if (result) {

                if (result.is_restart) {

                    const use = await User.find(auth.user.id)
                    const userI = await use
                        .url_token()
                        .update({ is_restart: 0 })
                    await this.restart(auth.user.id);

                }

            }


        }, 5000);



    }
    async restart(id) {
        const cc = new C();
        const resultCaptcha = await cc.GetCaptcha(id);
        const validatorr = new ID()
        const resultValidatorr = await validatorr.GetId(id);
    }
}

module.exports = BotController
