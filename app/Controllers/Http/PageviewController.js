'use strict'
const Database = use('Database')
const Config = use('App/Models/Config')
const User = use('App/Models/User')
class PageviewController {
    async  showAdmin({ view }) {
        let err;

        const user = await Database.select('active').from('users')
        let ativos = 0;
        let inativos = 0;
        for (let index = 0; index < user.length; index++) {

            if (user[index].active == 1) {
                ativos++
            } else {
                inativos++
            }

        }



        return view.render('layout.admin', { ativos, inativos })

    }
    async showUser({ view, auth }) {

        return view.render('layout.adminUser')


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
    async showUsers({ view }) {


        const result = await Database.select('creditos').from('configs')
        let Bdisable = ''
        let Btext = 'Salvar Dados'
        if (result == '') {
            Bdisable = "disabled"
            Btext = 'Cadastro desativado configure os créditos!'
        }

        return view.render('viewusers', { result, Bdisable, Btext })


    }

}

module.exports = PageviewController
