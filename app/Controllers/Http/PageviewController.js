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

        let atual = new Date().toISOString().replace(/\.\d{3}Z$/, '')
        let dateatual = atual.split('T')
        let antdate = use.end.split("-").reverse().join("-")
        var cred = isAfter(new Date(dateatual[0]), new Date(antdate))
        let msg = {
            h: 'hidden',
            c: '',
            md: '',
            m: '',
            b: '',
            t: 'Iniciar uma validação de cartões'
        }
        if (cred) {

            msg = {
                h: '',
                c: 'warning',
                md: 'Créditos Expirados:',
                m: 'Seus créditos expiram em: ' + use.end + ', por favor entre em contato com o administrador do sistema, para obter novos créditos',
                b: 'disabled',
                t: 'adicione novos créditos para poder iniciar uma nova validação de cartões'
            }

        }
        if (use.balance < 10 && cred == false) {
            msg = {
                h: '',
                c: 'info',
                md: 'Créditos Acabando!',
                m: auth.user.username + ', seus créditos estão acabando por favor entre em contato com o administrador do sistema!',
                b: '',
                t: 'Iniciar uma validação de cartões'

            }
        }
        if (use.balance == 0) {
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


        const result = await Database.select('creditos').from('configs')
        let Bdisable = ''
        let Btext = 'Cadastrar'
        if (result == '') {
            Bdisable = 'disabled'
            Btext = 'Cadastro desativado configure a quantidade de créditos primeiro!'
        }

        return view.render('caduser', { result, Bdisable, Btext })


    }
    async showUsers({ view, auth }) {



        const result = await Database.select('creditos').from('configs')

        let Bdisable = ''
        let Btext = 'Salvar Dados'
        if (result == '') {
            Bdisable = "disabled"
            Btext = 'Cadastro desativado configure os créditos!'
        }

        let items = ''

        for (let index = 0; index < result.length; index++) {
            if (result.length == index + 1) {
                items += `${result[index].creditos}:${result[index].creditos}`
            } else {
                items += `${result[index].creditos}:${result[index].creditos};`
            }

        }

        return view.render('viewusers', { items, result, Bdisable, Btext })


    }

}

module.exports = PageviewController
