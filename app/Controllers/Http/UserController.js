'use strict'
const Database = use('Database')
const User = use('App/Models/User')
class UserController {
    async ReturnUsers({ response }) {

        const user = await Database.select('*').from('users')

        var result = [];
        for (let index = 0; index < user.length; index++) {
            if (user[index].level != 1) {
                result.push({
                    username: user[index].username,
                    name: user[index].fullname,
                    balance: user[index].balance,
                    start: user[index].start,
                    end: user[index].end,
                    active: user[index].active
                })
            }

        }

        return response.json(result);
    }
    async  register({ request, session, response }) {
        try {

            let d = await User.query()
                .where('username', request.input('username'))
                .first()

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
    async delete({ request, session, response }) {

    }
    async updateUser({ request, session, response }) {
        let campos = request.all();
        const affectedRows = await Database
            .table('users')
            .where('username', campos.username)
            .update(
                {
                    username: campos.username,
                    fullname: campos.name,
                    balance: campos.balance,
                    start: campos.start,
                    end: campos.end,
                    active: campos.active,
                }
            )
        return { msg: 'user atualizado com sucesso' }
    }
    async delUser({ request, session, response }) {
        let campos = request.all();
        const affectedRows = await Database
            .table('users')
            .where('username', campos.id)
            .delete()
        return { msg: 'user deletado com sucesso' }
    }
    async status({ request, response, auth }) {
        const r = request.all()
        if (request.ajax()) {
            await Database.table('users').where('id', auth.user.id).update({ on: r.status })
            Database.close()
        }
    }
    async Getstatus({ request }) {
        if (request.ajax()) {
            const total = await Database
                .from('users')
                .sum('on as t')

            Database.close()
            return total[0].t
        }
    }


}

module.exports = UserController
