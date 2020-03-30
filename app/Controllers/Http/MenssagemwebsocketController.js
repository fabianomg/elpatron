"use strict";
const Ws = use("Ws");
class MenssagemwebsocketController {
  constructor({ socket, auth }) {
    this.socket = socket;
  }
  static async stop(id) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      await topic.broadcastToAll("status", "Aguardando...");
      await topic.broadcastToAll(
        "atividades",
        "Processo finalizado com sucesso!!"
      );
    }
  }
  static async stop1(id) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      await topic.broadcastToAll("status", "Aguardando...");
      await topic.broadcastToAll(
        "atividades",
        "Todos os processos foram finalizado com sucesso!!, reinicie a página para atualizar os dados e fazer nova verificação, se a página não for atualizada os dados continuaram sendo atualizados do ultimo processo ativo"
      );
    }
  }
  static async stop2(id) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      await topic.broadcastToAll("status", "Aguardando...");
      await topic.broadcastToAll(
        "atividades",
        "Aguarde estamos parando todos os processos......"
      );
    }
  }
  static async interacao01(id) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      topic.broadcastToAll("status", "Processando dados...");
      topic.broadcastToAll("atividades", "Iniciando verificação Aguarde....");
    }
  }
  static async interacao02(id, total, testados, cards) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);

    if (topic) {
      topic.broadcastToAll("total", total);
      if (cards != 0) {
        topic.broadcastToAll("testados", testados);
        topic.broadcastToAll("reprovados", testados);
        for (const item of cards) {
          let card = item.split("#");
          console.log(card[1]);
          if (card[1] == "true") {
            let msg =
              '<li class="tree-item" role="treeitem"><span class="tree-item-name"><span class="tree-label">' +
              '<i class=" fa fa-credit-card green"></i> ' +
              card[0] +
              "  </span></span>" +
              '<span class="label label-sm label-success">JÁ FOI TESTADO </span> </li>';
            topic.broadcastToAll("listreprovados", msg);
          } else {
            let msg =
              '<li class="tree-item" role="treeitem"><span class="tree-item-name"> <span class="tree-label"> ' +
              ' <i class=" fa fa-credit-card red">  </i> ' +
              card[0] +
              "  </span>  </span>" +
              ' <span class="label label-sm label-danger">NEGADO</span>  <span class="label label-sm label-info">ELPATRON</span> </li>';
            topic.broadcastToAll("listreprovados", msg);
          }
        }
      }
    }
  }
  static async demorando(id) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      topic.broadcastToAll(
        "atividades",
        "Captcha demorou mais de 2 minutos para ser resolvido, aguarde... fazendo nova requisição"
      );
    }
  }
  static async interacao03(id) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      topic.broadcastToAll(
        "atividades",
        "Estamos resolvendo o captcha Aguarde...."
      );
    }
  }
  static async interacao04(id, number, card, saldo) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      await topic.broadcastToAll("aprovados", number);
      await topic.broadcastToAll("testados", number);
      await topic.broadcastToAll("saldo", saldo);
      await topic.broadcastToAll(
        "atividades",
        "ELPATRON, Card verificado  Aguarde...."
      );
      let msg =
        '<li class="tree-item" role="treeitem"><span class="tree-item-name"> <span class="tree-label"> ' +
        ' <i class=" fa fa-credit-card green">  </i> ' +
        card +
        "  </span>  </span>" +
        ' <span class="label label-sm label-success">APROVADO</span>  <span class="label label-sm label-info">ELPATRON</span> </li>';
      topic.broadcastToAll("listaprovados", msg);
    }
  }
  static async interacao05(id, number, card) {
    const topic = await Ws.getChannel("users:*").topic("users:" + id);
    if (topic) {
      await topic.broadcastToAll("reprovados", number);
      await topic.broadcastToAll("testados", number);
      await topic.broadcastToAll(
        "atividades",
        "ELPATRON, Card verificado  Aguarde...."
      );
      let msg =
        '<li class="tree-item" role="treeitem"><span class="tree-item-name"> <span class="tree-label"> ' +
        ' <i class=" fa fa-credit-card red">  </i> ' +
        card +
        "  </span>  </span>" +
        ' <span class="label label-sm label-danger">NEGADO</span>  <span class="label label-sm label-info">ELPATRON</span> </li>';
      topic.broadcastToAll("listreprovados", msg);
    }
  }
}

module.exports = MenssagemwebsocketController;
