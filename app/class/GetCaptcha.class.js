'use strict'
const Ws = use("Ws");
const Database = use('Database')
const Client = require('@infosimples/node_two_captcha');

class Captcha {

    async GetBalance() {
        let apikey = await Database.select('api').from('captchas')
        // 'd20eab822faf0d858c62d43d002148b4
        var b = new Client(apikey, {
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


        // 'd20eab822faf0d858c62d43d002148b4
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

                const token_recaptcha = await Database
                    .table('url_tokens')
                    .insert({ 'user_id': user_id, 'token_recaptcha': response['_text'] })


            }).catch(async (erro) => {
                console.log(erro)
                const token_recaptcha = await Database
                    .table('url_tokens')
                    .insert({ 'erro_token': erro })
            })

        } catch (error) {
            return error

        }

    }



}
module.exports = Captcha;
