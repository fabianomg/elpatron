"use strict";
const Amarithcafe = require("./AmarithcafeController");
const Axios = require("axios");
const Redis = use("Redis");
const Menssagem = require("./MenssagemwebsocketController");
let cont = 0;
class VerifycardController {
  static async verify(id) {
    const token = {
      id: id,
      redis: false,
      googlekey: "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
      pageurl: "https://amarithcafe.revelup.com",
      site: {
        name: "deathbycaptcha",
        api: "dcfa48509f1dc4ac0c57a890c46b0628",
        username: "elpatron1986",
        password: "Ff209015#"
      }
    };
    await Axios.post(
      `http://captcha:3331/getToken`,
      token,
      { timeout: 200000 },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
          Accept: "application/json"
        }
      }
    )
      .then(response => {
        Amarithcafe.getcode(id, response.data);
      })
      .catch(err => {
        cont++;
        let e = err.message.indexOf("exceeded");
        if (e != -1 && cont <= 1) {
          this.teste(id);
          Menssagem.demorando(id);
        } else {
          Redis.set(id + "restart",'ok');
        }
      });
  }
}

module.exports = VerifycardController;
