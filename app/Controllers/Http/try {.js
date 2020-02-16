try {

   

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