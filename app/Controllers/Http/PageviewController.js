'use strict'
const Database = use('Database')
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

}

module.exports = PageviewController
