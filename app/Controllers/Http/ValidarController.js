"use strict";
const Textarea = require("./ValidartextareaController");
const Menssagem = require("./MenssagemwebsocketController");
const Redisdb = require("./RediController");
const Mongodb = require("./MongoController");
const Verifycards = require("./VerifycardController");
const Exceptions = require("./ExceptionController");
const Redis = use("Redis");

class ValidarController {
  async start({ auth, request, session, response }) {
    const inicio = request.body;
    console.log(inicio)
    let start;
    if (inicio) {
      const id = auth.user.id;
      const user = auth.user.username;
      // verificar se o textarea está vazio
      Textarea.areavazio(request, session, response);
      //pegar cartões do textarea
      const cards = Textarea.getcardstextarea(request);
      // verificar padrão dos cartões do text area
      Textarea.padraotextarea(session, response, cards);
      //verificar aquantidade cartões digitados no text area
      Textarea.areatextlength(session, response, cards);

      // interagir com user se tudo passou
      Menssagem.interacao01(id);
      //criar lista de cartões no redis
      const creatlist = await Redisdb.createcardlist(id, cards);

      creatlist == "ok"
        ? Mongodb.verificarcardsnobanco(id, cards)
        : Exceptions.EXcreatecardlist(creatlist, cards, user); // ponto a ser verificado novamente
      //verificar os cartões
      setTimeout(async () => {
        Verifycards.verify(id);
      }, 800);
      start = setInterval(async () => {
        Redis.smembers(id + "amarith", async (err, list) => {
          if (list == "") {
            clearInterval(start);
            Redis.keys("*", (err, re) => {
              for (let index = 0; index < re.length; index++) {
                let d = re.indexOf(id);
                if (d != -1) {
                  Redis.del(re[index]);
                  if (re != null) {
                  }
                }
              }
            });
            Menssagem.stop(id);
          }
        });

        Redis.smembers(id + "restart", async (err, result) => {
          Redis.smembers(id + "listcards", async (err, list) => {
            if (list == "") {
              clearInterval(start);
              Redis.keys("*", (err, re) => {
                for (let index = 0; index < re.length; index++) {
                  let d = re.indexOf(id);
                  console.log(d);
                  if (d == -1) {
                    Redis.del(re[index]);
                  }
                }
              });
              Menssagem.stop(id);
            }
          });

          if (result != null) {
            Verifycards.verifyrestart(id);
          }
        });
      }, 5000);
    } else {
      Redis.smembers(id + "listcards", async (err, list) => {
        if (list == "") {
          clearInterval(start);
          Redis.keys("*", (err, re) => {
            for (let index = 0; index < re.length; index++) {
              let d = re.indexOf(id);
              if (d == -1) {
                Redis.del(re[index]);
              }
            }
          });
          Menssagem.stop(id);
        }
      });
    }
  }
}

module.exports = ValidarController;
