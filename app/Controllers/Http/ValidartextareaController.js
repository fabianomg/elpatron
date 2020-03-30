"use strict";

class ValidartextareaController {
  static areavazio(Request, Session, Response) {
    const textarea = Request.input("textarea");
    if (textarea == "") {
      Session.flash({
        notification: {
          type: "warning",
          message: "campo vazio!, você precisa colocar no minimo 5 cartões"
        }
      });
      return Response.redirect("back");
    }
  }
  static padraotextarea(Session, Response, cards) {
    if (cards == null) {
      Session.flash({
        notification: {
          type: "warning",
          message:
            'não foi encontrado cartões com o  padrão  aceito, os cartões devem está igual há => "000000000000000|00|0000|000" , verifique o padrão dos cartões da sua lista.'
        }
      });
      return Response.redirect("back");
    }
  }
  static areatextlength(session, response, cards) {
    
    if (cards != null) {
      for (const item of cards) {
        let fistnumber = item.substr(0, 2);

        if (fistnumber != 65) {
          session.flash({
            notification: {
              type: "warning",
              message:
                "existe cartões iniciado com: " +
                fistnumber +
                ", apenas cartões iniciados com o número 65 são aceitos, por favor reveja sua lista de cartões"
            }
          });
          return response.redirect("back");
        }
      }

      if (cards.length < 5) {
        session.flash({
          notification: {
            type: "warning",
            message: "quantidade miníma de cartões para verificação é 5"
          }
        });
        return response.redirect("back");
      }

      if (cards.length > 200) {
        session.flash({
          notification: {
            type: "warning",
            message:
              "a quantidade de cartões que pode ser verificada por vez é 200, sua lista está com: " +
              texto2.length +
              " por favor reveja sua lista."
          }
        });
        return response.redirect("back");
      }
    }
  }

  static getcardstextarea(Request) {
    const texto = Request.input("textarea");
    let cards;
    const regex = /\d{16}[ |]\d{2}[ |]\d{4}[ |]\d{3}/gi;
    texto != null ? (cards = texto.match(regex)) : (cards = null);
    return cards;
  }
}

module.exports = ValidartextareaController;
