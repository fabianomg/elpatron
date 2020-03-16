'use strict'
const Ws = use('Ws')
const Database = use('Database')
const Config = use('App/Models/Config')
const User = use('App/Models/User')
var { isAfter, parseISO, format } = require('date-fns')
class PageviewController {
    async  showAdmin({ view }) {

        const total = await Database
            .from('users')
            .sum('on as t')

        Database.close()

        let online = total[0].t
        let err;

        const user = await Database.select('*').from('users')
        let ativos = 0;
        let inativos = 0;
        for (let index = 0; index < user.length; index++) {

            if (user[index].active == 1 && user[index].level != 1) {
                ativos++
            } if (user[index].active == 0 && user[index].level != 1) {
                inativos++
            }

        }

        return view.render('layout.admin', { online, ativos, inativos })

    }
    async showUser({ view, auth, session }) {
        const use = await User.find(auth.user.id)
        let type = use.balance.split(' ')
        console.log(type)
        // let cred = use.balance
        let atual = new Date().toISOString().replace(/\.\d{3}Z$/, '')
        let dateatual = atual.split('T')
        let dateA = dateatual[0] + ' ' + dateatual[1]
        //console.log(use.end)
        //let antdate = use.end.split("-").reverse().join("-")
        //var cred = isAfter(new Date(dateatual[0]), new Date(antdate))


        const cred = isAfter(parseISO(use.end), new Date()); // true

        let msg = {
            h: 'hidden',
            c: '',
            md: '',
            m: '',
            b: '',
            t: 'Iniciar uma validação de cartões'
        }
        if (!cred) {
            msg = {
                h: '',
                c: 'warning',
                md: 'Créditos Expirados:',
                m: 'Seus créditos expiram em: ' + use.end + ', por favor entre em contato com o administrador do sistema, para obter novos créditos',
                b: 'disabled',
                t: 'adicione novos créditos para poder iniciar uma nova validação de cartões'
            }

        }
        if (type[1] == 'creditos') {
            if (type[0] < 10 && cred == false) {
                msg = {
                    h: '',
                    c: 'info',
                    md: 'Créditos Acabando!',
                    m: auth.user.username + ', seus créditos estão acabando por favor entre em contato com o administrador do sistema!',
                    b: '',
                    t: 'Iniciar uma validação de cartões'

                }
            }
        }
        if (type[0] == 0) {
            msg = {
                h: '',
                c: 'danger',
                md: 'Créditos Acabaram!',
                m: auth.user.username + ', você não possui créditos no momento, por favor entre em contato com o administrador do sistema para solicitar novos créditos.',
                b: 'disabled',
                t: auth.user.username + ' você não possui créditos para iniciar uma validação de cartões'
            }
        }


        return view.render('layout.adminUser', { msg })


    }
    async showCaduser({ view }) {
        Database.table('users').select('*')
        const resultd = await Database.select('dias').from('configs').orderBy('dias', 'desc')
        const result = await Database.select('creditos').from('configs').orderBy('creditos', 'desc')
        //console.log(result[0].creditos)
        let Bdisable = ''
        let Btext = 'Cadastrar'
        if (result == '' && resultd == '') {
            Bdisable = 'disabled'
            Btext = 'Cadastro desativado configure a quantidade de créditos ou dias primeiro!'
        }

        return view.render('caduser', { result, resultd, Bdisable, Btext })


    }
    async showUsers({ view, auth }) {

        const result = await Database
            .from('configs')
            .whereNot('creditos', '=', '')
        const result1 = await Database
            .from('configs')
            .whereNot('dias', '=', '')

        let items;

        for (let index = 0; index < result.length; index++) {
            items += `${result[index].creditos}:${result[index].creditos};`
        }
        for (let index = 0; index < result1.length; index++) {
            items += `${result1[index].dias}:${result1[index].dias};`
        }

        return view.render('viewusers', { items })


    }

}

module.exports = PageviewController
