'use strict'
const request = require('request');
class TesteController {

    async teste() {
       
        await request.post('167.114.223.9:3000/api', {
            formData: formData,

            headers: {
                'Host': 'transaction.hostedpayments.com',
                'Connection': 'keep-alive',
                'Content-Length': '18243',
                'X-Requested-With': 'XMLHttpRequest',
                'Cache-Control': 'no-cache',
                'X-MicrosoftAjax': 'Delta=true',
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.117 Safari/537.36',
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Accept': '*/*',
                'Origin': 'https://transaction.hostedpayments.com',
                'Sec-Fetch-Site': 'same-origin',
                'Sec-Fetch-Mode': 'cors',
                'Referer': 'https://transaction.hostedpayments.com/?TransactionSetupID=61662BE1-E807-437B-AA1F-40720DEF27BA',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7'

            }
        }, function (err, res, body) {
            console.log(body)
        })
    }
}

module.exports = TesteController
