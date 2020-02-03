'use strict'
const Database = use('Database')
const User = use('App/Models/User')
class UserController {
    async ReturnUsers({ request, response }) {
        const user = await Database.select('*').from('users')
        var result = [];
        for (let index = 0; index < user.length; index++) {

            result.push({
                Usernme: user[index].username,
                Nome: user[index].name,
                creditos: user[index].creditos,
                start: user[index].start,
                end: user[index].end,
                expiracao: user[index].expiracao,
                status: user[index].active
            })

        }
        var dados = { data: result };
        return response.json(dados);
    }
    async  register({request}){
        const user = await User.create({
            username: request.input('username'),
            fullname: request.input('name'),
            password: request.input('password'),
            balance: request.input('creditos'),
            start: request.input('start'),
            end: request.input('end'),
            level: 2,
            active: request.input('active')
            //confirmation_token: randomString({ length: 40 })
          })
    }
}

module.exports = UserController
