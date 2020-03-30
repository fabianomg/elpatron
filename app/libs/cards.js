'use strict'
const Redis = use('Redis')
class Cards {
    async verificarbanco(req, res) {
        let id = req.body.id;
        try {

            Redis.lrange(id + 'listcards', 0, -1, function (err, ca) {

                for (const c of ca) {

                    let card = c.split('|');

                    CadastroCards.find({ 'card.number': card[0] }, (arr, result) => {

                        if (result != '') {
                            Cache.lrem(id + 'listcards', 0, c);
                            switch (result[0].valid) {
                                case true:

                                    Cache.sadd(id + 'listduplicadosvalidos', c);

                                    break;
                                case false:
                                    Cache.sadd(id + 'listduplicadosinvalidos', c);

                                    break;

                                default:

                                    break;
                            }
                        }
                    });

                }
            });

        } catch (error) {
            return res.json(error.message)
        }
        return res.json({
            totalcards: 10

        })


    }


}
module.exports = Cards