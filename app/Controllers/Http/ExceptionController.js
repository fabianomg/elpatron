"use strict";
const Redisdb = require("./RediController");
const Axios = require("axios");
class ExceptionController {
  static async EXcreatecardlist( cards, user) {
      //tento cadastrata novamente no redis
    let result = await Redisdb.createcardlist(cards);
    if (result == "ok") {
      return "okok";
    } else {
      const dados = {
        user: user,
        msg: result
      };

      await Axios
        .post(`http://pont-mongodb:3332/createexcepitons`, dados, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
            Accept: "application/json"
          }
        })
        .then(response => {

        });
    }
  }
}

module.exports = ExceptionController;
