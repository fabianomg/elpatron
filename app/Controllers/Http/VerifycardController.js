"use strict";
const Amarithcafe = require("./AmarithcafeController");
const Axios = require("axios");
const Redis = use("Redis");
const Menssagem = require("./MenssagemwebsocketController");
let cont =0;
class VerifycardController {
  static async verify(id) {
    const token_params = await JSON.stringify({
      googlekey: "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
      pageurl: "https://amarithcafe.revelup.com"
    });
console.log('tste')
/*
    const DEA = new DBC("elpatron1986", "Ff209015#");
    try {
      let time = setTimeout(() => {
        console.log(cont)
        cont++;
      }, 5000);
      if (cont >= 20) {
        cont = 0;
        clearInterval(time);
        Redis.set(id + "restart", "ok");
      }
      await DEA.decode(
        { extra: { type: 4, token_params: token_params } },
        captcha => {
          console.log(captcha)
          Amarithcafe.getcode(id, captcha);
          cont = 0;
          clearInterval(time);
        }
      );
    } catch (err) {
      Redis.set(id + "restart", "ok");
    }
    */
    
    const token = {
      googlekey: "6Ld4hsgUAAAAACpJsfH-QTkIIcs0NAUE1VzDZ8Xq",
      pageurl: "https://amarithcafe.revelup.com",
      username: "elpatron1986",
      password: "Ff209015#"
    };
    
    await Axios.post(
      `http://107.178.109.212:3303/token`,
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
        console.log(response.data);
        Amarithcafe.getcode(id, response.data);
      })
      .catch(err => {
        cont++;
        let e = err.message.indexOf("exceeded");
        if (e != -1 && cont <= 1) {
          this.verify(id);
          Menssagem.demorando(id);
        } else {
          Redis.set(id + "restart", "ok");
        }
      });
      
  }
}

module.exports = VerifycardController;
//docker exec -it 15ceffdfd032 /bin/sh -c "[ -e /bin/bash ] && /bin/bash || /bin/sh"root@e844e25d44fa:/#
