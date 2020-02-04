'use strict'
const Database = use('Database')
const User = use('App/Models/User')
class UserController {
    async ReturnUsers({ request, response }) {

        const user = await Database.select('*').from('users')
        
        var result = [];
        for (let index = 0; index < user.length; index++) {

            result.push({
                username: user[index].username,
                fullname: user[index].fullname,
                balance: user[index].balance,
                start: user[index].start,
                end: user[index].end,
                active: user[index].active
            })

        }
      
        var dados = { data: result };
        return response.json(dados);
    }
    async  register({ request, session, response }) {
        try {

            let d = await User.query()
                .where('username', request.input('username'))
                .first()
            console.log(d)
            if (!d) {
                const u = await User.create({
                    username: request.input('username'),
                    fullname: request.input('fullname'),
                    password: request.input('password'),
                    balance: request.input('creditos'),
                    start: request.input('start'),
                    end: request.input('end'),
                    active: request.input('active'),
                    level: 2

                })
                session.flash({
                    notification: {
                        type: 'success',
                        message: 'O Usuário: ' + request.input('username') + ' Foi Cadastrado com sucesso!'
                    }
                })
            } else {
                session.flash({
                    notification: {
                        type: 'danger',
                        message: 'O Usuário: ' + request.input('username') + ' já está cadastrado no sistema'
                    }
                })
            }

        } catch (error) {
            session.flash({
                notification: {
                    type: 'danger',
                    message: 'Erro no cadastro do usuário  =>>' + error
                }
            })
        }
        return response.redirect('back')
    }
}

module.exports = UserController
