'use strict'
const { Curl } = require('node-libcurl');
const Database = use('Database')
const User = use('App/Models/User')
const querystring = require('querystring');

class VadateCardController {

    async GetId(user_id) {
        await this.GetViews('C2080731-1D7F-4127-9096-2BC2FA6D21CF')
        return
        let token;
        let time;
        time = setInterval(async () => {
            console.log('....')

            let result = await Database
                .table('url_tokens')
                .where('user_id', user_id)
                .first()
            if (result) {

                token = await result.token_recaptcha
                const curl = new Curl();
                curl.setOpt('URL', 'https://amarithcafe.revelup.com/weborders/create_order_and_pay_v1/');
                curl.setOpt('PROXY', 'http://f1ca55670d414417ad52b796e2242a4d:@proxy.crawlera.com:8010');
                curl.setOpt('HEADER', 1);
                curl.setOpt('FOLLOWLOCATION', 1);
                curl.setOpt(Curl.option.POST, 1);
                curl.setOpt('SSL_VERIFYPEER', 0);
                curl.setOpt('SSL_VERIFYHOST', 0);
                curl.setOpt(Curl.option.IGNORE_CONTENT_LENGTH, 136);
                curl.setOpt(Curl.option.HTTPHEADER, [
                    'Host: amarithcafe.revelup.com',
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
                    'Accept: application/json',
                    'Referer: https://amarithcafe.revelup.com/weborder/?establishment=1',
                    'Content-Type: application/x-www-form-urlencoded',
                    'Connection: keep-alive']
                );


                curl.setOpt(Curl.option.POSTFIELDS, '{"skin":"weborder","establishmentId":1,"items":[{"modifieritems":[],"price":1.5,"product":209,"product_name_override":"z","quantity":1,"product_sub_id":"c1160"}],"orderInfo":{"created_date":"2020-01-27T16:47:31","pickup_time":"2020-02-5T22:45:00","dining_option":0,"customer":{"phone":"1","email":"b@o.com","first_name":"B","last_name":"L"},"call_name":""},"paymentInfo":{"tip":0,"type":2},"recaptcha_v2_token":"' + token + '"}');
                let id_url;
                let ResultCurl = await curl.on('end', async (statusCode, data) => {

                    if (data.indexOf("\"status\": \"ERROR\"") != -1) {
                        console.log(data)
                        return 'error'

                    } else {
                        // console.log(data)
                        let inicio = data.indexOf("\"TransactionSetupID\": \"");

                        id_url = await data.substr(inicio + 23, 36)

                        const user = await User.find(user_id)
                        const userI = await user
                            .url_token()
                            .update({ url_id: id_url, token_recaptcha: null })
                        setTimeout(async () => {
                            console.log('processo 1 terminado ')
                            await this.GetViews(id_url)
                        }, 500);

                        return
                    }
                });
                curl.on('error', curl.close.bind(curl))
                curl.perform()
                clearInterval(time)

            }

        }, 5000);

    }

    async GetViews(idd) {

        const curl1 = new Curl();
        curl1.setOpt('URL', 'https://transaction.hostedpayments.com/?TransactionSetupID=' + idd + '');
        curl1.setOpt('USERAGENT', "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0");
        curl1.setOpt('FOLLOWLOCATION', 1);
        curl1.setOpt('SSL_VERIFYPEER', 0);
        curl1.setOpt('SSL_VERIFYHOST', 0);
        curl1.setOpt(Curl.option.HTTPHEADER, [
            'Host: transaction.hostedpayments.com',
            'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
            'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Connection: keep-alive',
            'Upgrade-Insecure-Requests: 1',
        ]);

        let ResultCurl = await curl1.on('end', async (statusCode, data) => {

            let GETVIEWSTATE = data.indexOf('name="__VIEWSTATE" id="__VIEWSTATE" value="'); //47
            let GETVIEWSTATEGENERATOR = data.indexOf('name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="'); //64
            let GETEVENTVALIDATION = data.indexOf('name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="');//59

            let FinalVIEWSTATE = await data.indexOf('"', GETVIEWSTATE + 44);
            let FinalVIEWSTATEGENERATOR = await data.indexOf('"', GETVIEWSTATEGENERATOR + 62);
            let FinalEVENTVALIDATION = await data.indexOf('"', GETEVENTVALIDATION + 56);

            let STATE = await data.substr(GETVIEWSTATE + 43, FinalVIEWSTATE - (GETVIEWSTATE + 43))
            let STATEGENERATOR = await data.substr(GETVIEWSTATEGENERATOR + 61, FinalVIEWSTATEGENERATOR - (GETVIEWSTATEGENERATOR + 61))
            let EVENTVALIDATION = await data.substr(GETEVENTVALIDATION + 55, FinalEVENTVALIDATION - (GETEVENTVALIDATION + 55))


            setTimeout(async () => {
                const curl2 = new Curl();
                let cc = '6504867262783814'
                let mes = '06'
                let ano = '2023'
                let cvv_random = '000'

                // 6504867262787880|06|2023|000
                curl2.setOpt('URL', 'https://transaction.hostedpayments.com/?TransactionSetupID=' + idd + '');
                //curl2.setOpt('PROXY', 'http://f1ca55670d414417ad52b796e2242a4d:@proxy.crawlera.com:8010');
                curl2.setOpt('HEADER', 1);
                curl2.setOpt(Curl.option.POST, 1);
                curl2.setOpt('USERAGENT', "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0");
                curl2.setOpt('FOLLOWLOCATION', 1);
                curl2.setOpt('SSL_VERIFYPEER', 0);
                curl2.setOpt('SSL_VERIFYHOST', 0);
                curl2.setOpt('CONNECTTIMEOUT', 2);
                curl2.setOpt(Curl.option.HTTPHEADER, [
                    'Host: transaction.hostedpayments.com',
                    'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
                    'Accept: */*',
                    'X-Requested-With: XMLHttpRequest',
                    'X-MicrosoftAjax: Delta=true',
                    'Content-Type: application/x-www-form-urlencoded; charset=utf-8',
                    'Connection: keep-alive',
                    'Referer: https://transaction.hostedpayments.com/?TransactionSetupID=' + idd + '',
                ]);
                const data = [
                    {
                        name: 'filename',
                        contents: 'scriptManager=upFormHP%7CprocessTransactionButton&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=' + STATE + '&__VIEWSTATEGENERATOR=' + STATEGENERATOR + '&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=' + EVENTVALIDATION + '&hdnCancelled=&cardNumber=%20' + cc + '&ddlExpirationMonth=' + mes + '&ddlExpirationYear=' + ano + '&CVV=' + cvv_random + '&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__ASYNCPOST=true&',
                    },
                ]
                curl2.setOpt(Curl.option.HTTPPOST, data)

                let ResultCurl2 = await curl2.on('end', async (statusCode, data) => {
                    console.log(data)
                    if (data.indexOf("\"status\": \"ERROR\"") != -1) {

                        return 'error'

                    } else {
                        let inicio = data.indexOf("\"TransactionSetupID\": \"");

                    }
                });
                curl2.on('error', curl2.close.bind(curl2))
                curl2.perform()

            }, 1000);



            //const userS = await User.find(user_id)
            //const userI = await userS
            // .url_token()
            // .update({ state: STATE, generaton: STATEGENERATOR, validaton: EVENTVALIDATION })

        });
        curl1.on('error', curl1.close.bind(curl1))
        curl1.perform()
        console.log('processo 2 terminado')
    }
    async GetCard() {

    }
}

module.exports = VadateCardController
