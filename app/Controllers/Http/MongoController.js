"use strict";
const Axios = require("axios");
const Redis = use("Redis");
const Menssagem = require("./MenssagemwebsocketController");

class MongoController {
  static async verificarcardsnobanco(id, cards) {
    await Axios.post(`http://pont-mongodb:3332/verifycards`, cards, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
        Accept: "application/json"
      }
    }).then(async response => {
      let key = response.data;

      setTimeout(() => {
        Redis.smembers(key, async (err, result) => {
          // for para deletear da listacrds

          for (const item of result) {
            let d = item.split("#");
            Redis.srem(id + "listcards", 0, d[0]);
          }
          Redis.smembers(id + "listcards", async (err, t) => {
            let r;

            result != null ? (r = result.length) : (r = 0);

            let total = t.length + result.length;
            Menssagem.interacao02(id, total, r, result);
            if (t == '') {
              console.log("ok");
              Menssagem.stop(id);
            }
            //verificar se é true ou false
          });
        });
      }, 500);
    });
  }
}

module.exports = MongoController;
