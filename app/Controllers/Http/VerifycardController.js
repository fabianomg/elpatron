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
      username: "elpatron1986",
      password: "Ff209015#",
    };

    await Axios.post(
      `http://107.178.109.212:3001/token`,
      token,
      { timeout: 200000 },
      {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
          Accept: "application/json",
        },
      }
    )
      .then((response) => {
        console.log(response.data);
        let time = setInterval(async () => {
          console.log(cont);
          if (cont == 20) {
            clearInterval(time);
            cont = 0;
            this.verify(id);
          }
          Redis.exists(id + "token", (err, reply) => {
            if (reply == 1) {
              clearInterval(time);
              Redis.get(id + "token", async (err, token) => {
                console.log(token);
                cont = 0;
                Amarithcafe.getcode(id, token);
                Redis.del(id + "token");
              });
            }
          });
          cont++;
        }, 5000);
      })
      .catch((err) => {
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
