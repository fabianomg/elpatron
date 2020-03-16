'use strict'
const Ws = use("Ws");
const Database = use('Database')
const Client = require('@infosimples/node_two_captcha');
const User = use('App/Models/User')
const Cache = use('Cache')
class Captcha {

    async GetBalance() {
        let apikey = await Database.select('api')
            .from('captchas')
            .where('name', 'twocaptcha')
        
        var b = new Client(apikey[0].api, {
            timeout: 600000,
            polling: 5000,
            throwErrors: true
        });
        let t = await b.balance((balance) => {
            console.log(balance)
            return balance
        });

        return t
    }
    async GetCaptcha(user_id) {

        const apikey = await Database
            .table('captchas')
            .where('name', 'twocaptcha')
            .first()

        var client = new Client(apikey.api, {
            timeout: 600000,
            polling: 5000,
            throwErrors: true
        });

        try {

            console.log('aguarde...')
            client.decodeRecaptchaV2({
                googlekey: '6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq',
                pageurl: 'https://amarithcafe.revelup.com'
            }).then(async (response) => {

                await Cache.forever('user_id:' + user_id + '#token_recaptcha#', JSON.stringify(response['_text']))


            }).catch(async (erro) => {

                await Cache.forever('user_id:' + user_id + '#erro_recaptcha#', JSON.stringify(erro.message))
            })

        } catch (error) {
            return error

        }
        return
    }



}
module.exports = Captcha;
