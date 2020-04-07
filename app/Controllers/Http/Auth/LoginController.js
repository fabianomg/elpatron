"use strict";

const User = use("App/Models/User");
const Hash = use("Hash");
const Database = use("Database");
const Axios = require("axios");
class LoginController {
  async showLoginForm({ auth, view, response }) {
    try {
      let logado = await auth.check();
      if (logado) {
        const user = await User.query()
          .where("username", auth.user.username)
          .first();
        if (user == null) {
          session.flash({
            notification: {
              type: "warning",
              message:
                "o usuário  que você digitou não está cadastrado na nossa base de dados, por favor entre em contato com o administrador.",
            },
          });
          return response.redirect("back");
        }
        if (user.level == 1) {
          return response.route("/admin");
        }
        if (user.level == 2) {
          return response.route("/");
        }
      }
    } catch (error) {
      return view.render("auth.login");
    }
  }

  async login({ request, auth, session, response }) {
    // get form data
    const { username, password, remember } = request.all();
    const user = await User.query().where("username", username).first();
    try {
      let ip = await Axios.get("https://api.ipify.org/?format=json");

      if (user.ip == "") {
        await Database.table("users").where("username", username).update({
          ip: ip.data.ip,
        });
      }
      if (ip.data.ip != user.ip && user.ip != "") {
        session.flash({
          notification: {
            type: "danger",
            message: ` sua sessão expirou, detectamos que você está usando vários locais para fazer login, por favor tente novamente..`,
          },
        });
        return response.redirect("back");
      }
    } catch (error) {
      session.flash({
        notification: {
          type: "danger",
          message: `${user.username}, ${error.message}, O Sistema detectou um erro de login, por favor atualize a página ou saia do modo anonimo do navgador.`,
        },
      });
    }

    try {
      // retrieve user base on the form data

      let captcha = await Database.table("captchas")
        .select("active")
        .orderBy("active", "desc");

      if (user == null) {
        session.flash({
          notification: {
            type: "warning",
            message:
              "o usuário  que você digitou não está cadastrado na nossa base de dados, por favor entre em contato com o administrador.",
          },
        });
        return response.redirect("back");
      }

      if (captcha != "" && user.level == 2) {
        if (captcha[0].active == 0) {
          session.flash({
            notification: {
              type: "warning",
              message: `${user.username}, O Sistema está temporariamente indisponível, por favor entre em contato com o administrador.`,
            },
          });
          return response.redirect("back");
        }
      }
      if (captcha == "" && user.level == 2) {
        session.flash({
          notification: {
            type: "warning",
            message: `${user.username}, O Sistema está temporariamente indisponível, por favor entre em contato com o administrador.`,
          },
        });
        return response.redirect("back");
      }
      if (user) {
        if (!user.active) {
          session.flash({
            notification: {
              type: "warning",
              message: `${user.username}, Você não está ativo ou está sem créditos por favor  entre em contato com o administrador.`,
            },
          });
          return response.redirect("back");
        }
      }
      const recaptcha = request.input("g-recaptcha-response");
      if (!recaptcha) {
        session.flash({
          notification: {
            type: "danger",
            message: `você precisa resolver o captcha para presegui.`,
          },
        });
        return response.redirect("back");
      }
      //const safePassword = await Hash.make('Ff209015#')
      //console.log(safePassword)

      if (user) {
        // verify password
        const passwordVerified = await Hash.verify(password, user.password);

        if (passwordVerified) {
          try {
            await auth.check();
            if (user.level == 1) {
              //await auth.remember(!!remember).login(user)
              return response.route("/admin");
            }
          } catch (error) {
            if (user.level == 1) {
              await auth.remember(!!remember).login(user);
              return response.route("/admin");
            }
          }
          try {
            await auth.check();
            if (user.level == 2) {
              //await auth.remember(!!remember).login(user)
              return response.route("/");
            }
          } catch (error) {
            if (user.level == 2) {
              await auth.remember(!!remember).login(user);
              return response.route("/");
            }
          }
        }
      }

      // display error message
      session.flash({
        notification: {
          type: "danger",
          message: `Não foi possível verificar suas credenciais. Verifique seu username e sua senha.`,
        },
      });

      return response.redirect("back");
    } catch (error) {
      return response.redirect("back");
    }
  }
}

module.exports = LoginController;
