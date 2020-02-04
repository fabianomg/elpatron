'use strict'
const Database = use('Database')
const Config = use('App/Models/Config')
class PageviewController {
    async  showAdmin({ view }) {

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
    showUser({ view }) {

        return view.render('layout.adminUser')


    }
    async showCaduser({ view }) {
        const result = await Database.select('creditos').from('configs')
        let Bdisable = ''
        let Btext = 'Cadastrar'
        if (result == '') {
            Bdisable = 'disabled'
            Btext = 'Cadastro Desativado Configure a quantidae de Créditos Primeiro!'
        }

        return view.render('caduser', { result, Bdisable,Btext })


    }

}

module.exports = PageviewController
