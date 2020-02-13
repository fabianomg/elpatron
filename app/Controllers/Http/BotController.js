'use strict'
const Ws = use('Ws')
const C = require('../../class/GetCaptcha.class');
const ID = require('./VadateCardController');
const User = use('App/Models/User')
const Card = use('App/Models/Card')
const Database = use('Database')

class BotController {

    async  start({ auth, request }) {

        const status = await Ws.getChannel('status:*').topic('status:s' + auth.user.id)
        const carregadas = await Ws.getChannel('status:*').topic('status:c' + auth.user.id)

        if (status) {
            status.broadcastToAll('message', { s: 'start', msg: 'Processando dados...' })
        }

        try {

            let txt = await request.only('txtstart')
            let cards = []
            if (txt.txtstart.length > 30) {
                let tt = txt.txtstart.split("\r\n")
                let cont = 0
                for (const items of tt) {
                    let t = items.split("|")


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
                    await carregadas.broadcastToAll('message', cont)
                }
            } else {
                let t = txt.txtstart.split("|")

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
        await c.GetCaptcha(auth.user.id);
        const validator = new ID()
        await validator.GetId(auth.user.id);


        let taskRestart = setInterval(async () => {
            const card = await User.find(auth.user.id)
            await card.loadMany({
                cards: (builder) => builder.where('is_tested', false)
            })
            let stopRestart = card.toJSON().cards.length

            if (stopRestart == 0) {
                clearInterval(taskRestart)

                const use = await User.find(auth.user.id)
                const userI = await use
                    .url_token()
                    .update({ is_restart: 0 })
                if (status) {
                    await status.broadcastToAll('message', { s: 'end', msg: 'Processamento OK!!...' })
                }

                ///deletar todos  os cartoes referente ao user
                console.log('parado')
                console.log(stopRestart)
                const user = await User.find(auth.user.id)
                await user
                    .cards()
                    .delete()
                const userD = await User.find(auth.user.id)
                await userD
                    .url_token()
                    .delete()
                return

            }

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
        await cc.GetCaptcha(id);
        const validatorr = new ID()
        await validatorr.GetId(id);
    }
}

module.exports = BotController
