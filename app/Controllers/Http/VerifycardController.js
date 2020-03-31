"use strict";
const Amarithcafe = require("./AmarithcafeController");
const Axios = require("axios");
const Redis = use("Redis");
const Menssagem = require("./MenssagemwebsocketController");

class VerifycardController {
  static async verify(id) {
    //pegar token recaptcha
    //Menssagem.interacao03(id);
    const token = {
      id: id,
      redis: false,
      googlekey: "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
      pageurl: "https://amarithcafe.revelup.com",
      site: {
        name: "twocaptcha",
        api: "e262288cabf75ce03e50c90de3c6db9c"
      }
    };
    await Axios.post(`http://captcha:3331/getToken`, token, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
        Accept: "application/json"
      }
    }).then(response => {
      Amarithcafe.getcode(id, response.data);
    });
  }
  static async verifyrestart(id) {
    //pegar token recaptcha
    // Menssagem.interacao03(id);
    const token = {
      "id":id,
      "rabbitmq":false,
      "googlekey":"6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
      "pageurl":"https://amarithcafe.revelup.com",
      "site":{
        "name":"twocaptcha",
        "api":"e262288cabf75ce03e50c90de3c6db9c",
        "username":"fabianomg202",
        "password":"DaqscLEz.Pb8Zkr"
      }
    }
    await Axios.post(`http://captcha:3331/getToken`, token, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
        Accept: "application/json"
      }
    }).then(response => {
      let cont = 0;
      let time = setInterval(() => {
        cont++;
        if (cont == 24) {
          cont = 0;
          clearInterval(time);
          Menssagem.demorando(id);
          Redis.set(id + "restart", "restart");
        }
      }, 5000);
      Amarithcafe.getcode(id, response.data);
    });
  }
}

module.exports = VerifycardController;
