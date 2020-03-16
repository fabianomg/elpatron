'use strict'
const dbc = require('./Deathbycaptcha.class.js');
const Redis = use('Redis')
const Cache = use('Cache')
const Database = use('Database')
// Proxy and Recaptcha token data
const token_params = JSON.stringify({
  //'proxy': 'http://f1ca55670d414417ad52b796e2242a4d:@proxy.crawlera.com:8010',
  //'proxytype': 'HTTP',
  'googlekey': '6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq',
  'pageurl': 'https://amarithcafe.revelup.com'
});

// Death By Captcha Socket Client

// const client = new dbc.HttpClient(username, password) for http client
class Recaptcha {

  async GetBalance() {
    const client1 = new dbc.HttpClient(username, password);
    try {

      let t = await client.get_balance((balance) => {
        //console.log(balance);
        return balance
      });

    } catch (error) {
      console.log(error);
    }
  }
  async CaptchaDecode(user_id) {
    const captcha = await Database.from('captchas').where('name', 'deathbycaptcha')

    const client = new dbc.HttpClient(captcha[0].login, captcha[0].password);
    try {
      console.log('aguarde...')
      const result = await client.decode({ extra: { type: 4, token_params: token_params } }, async (captcha) => {
       
        if (captcha) {
          await Cache.forever('user_id:' + user_id + '#token_recaptcha#', JSON.stringify(captcha['text']))
  
        }

      });

    } catch (error) {
      await Cache.forever('user_id:' + user_id + '#erro_recaptcha#', JSON.stringify(error.message))
    }
  }


}
module.exports = Recaptcha;
