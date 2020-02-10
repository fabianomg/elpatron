'use strict'
const Ws = use("Ws");
const Database = use('Database')
const Client = require('@infosimples/node_two_captcha');
const User = use('App/Models/User')
class Captcha {

    async GetBalance() {
        let apikey = await Database.select('api').from('captchas')
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

        var client = new Client(apikey.api, {
            timeout: 600000,
            polling: 5000,
            throwErrors: true
        });
        let result = await Database
            .table('url_tokens')
            .where('user_id', user_id)
            .first()
        try {
            
            console.log('aguarde...')
            client.decodeRecaptchaV2({
                googlekey: '6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq',
                pageurl: 'https://amarithcafe.revelup.com'
            }).then(async (response) => {

                if (result) {
                    const use = await User.find(user_id)
                    const userI = await use
                        .url_token()
                        .update({ token_recaptcha: response['_text'] })
                } else {
                    const token_recaptcha = await Database
                        .table('url_tokens')
                        .insert({ 'user_id': user_id, 'token_recaptcha': response['_text'] })
                }

            }).catch(async (erro) => {

                if (result) {
                    const use = await User.find(user_id)
                    const userI = await use
                        .url_token()
                        .update({ user_id, erro_token: erro.message })
                } else {
                    const token_recaptcha = await Database
                        .table('url_tokens')
                        .insert({ 'user_id': user_id, 'erro_token': erro.message })
                }
            })

        } catch (error) {
            return error

        }
        return
    }



}
module.exports = Captcha;
