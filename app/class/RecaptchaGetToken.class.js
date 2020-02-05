const dbc = require('./Deathbycaptcha.class.js');
const Redis = use('Redis')

const username = 'elpatron2020';     // DBC account username
const password = 'Ff209015#';     // DBC account password

// Proxy and Recaptcha token data
const token_params = JSON.stringify({
  'proxy': 'http://f1ca55670d414417ad52b796e2242a4d:@proxy.crawlera.com:8010',
  'proxytype': 'HTTP',
  'googlekey': '6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq',
  'pageurl': 'https://amarithcafe.revelup.com'
});

// Death By Captcha Socket Client
const client = new dbc.HttpClient(username, password);
// const client = new dbc.HttpClient(username, password) for http client
class Recaptcha {

  async GetBalance() {
    try {

      let t = await client.get_balance((balance) => {
        //console.log(balance);
        return balance
      });
     
    } catch (error) {
      console.log(error);
    }
  }
  async CaptchaDecode(req, res) {
    const result = await client.decode({ extra: { type: 4, token_params: token_params } }, async (captcha) => {

      if (captcha) {
        await Redis.set('recaptcha', JSON.stringify(captcha['text']))

        return captcha['text']

      }

    });
    console.log(result);
    return result

  }


}
module.exports = Recaptcha;
