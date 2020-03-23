 // ###########carregadas################
 const status = ws.subscribe('status:s' + id)

 status.on('message', (s) => {
     let msg = '<div id="msgg" class=" col-md-4 col-md-offset-4 alert alert-warning"><button type="button" class="close" data-dismiss="alert"><i class="ace-icon fa fa-times"></i></button>' + s.msg + '<br></div>'
     $('#menss').html(msg)
     console.log(s.msg)
     $('#atividade').text(s.msg)
     if (s.s == 'start') {
         $('#cstatus').addClass('fa-spin')
     }
     if (s.s == 'end') {
         $('#cstatus').removeClass('fa-spin')
     }

     //$('#status').text(s.msg)
 });
 // ###########carregadas################
 const carregadas = ws.subscribe('status:c' + id)

 carregadas.on('message', (c) => {

     $('#carregadas').text(c)
 });
 // ###########testadas################
 const testadas = ws.subscribe('status:t' + id)

 testadas.on('message', (t) => {
     if (t == '') {
         $('#testadas').text(0)

     } else {
         $('#testadas').text(t)
     }

 });
 // ###########reprovadas################
 const reprovadas = ws.subscribe('status:r' + id)

 reprovadas.on('message', (r) => {

     if (r.cont == 0) {
         console.log(r.cont)
         $('#resultAprovadas .remov').remove()
     } else {
         $('#resultReprovadas').append(r.msg)
     }

     $('#reprovadas').text(r.cont)
     $('#repro').text(' #' + r.cont + '#')
 });
 // ###########button start################
 const start = ws.subscribe('status:st' + id)
 start.on('message', (st) => {
     const buttons = $("button[id='start']");
     buttons.prop('disabled', st)
     console.log(st)

 });
 // ###########button stop################
 const stop = ws.subscribe('status:stop' + id)
 stop.on('message', (stop) => {
     const buttons2 = $("button[id='stop']");
     buttons2.prop('disabled', stop)

 });

 // ###########aprovadas################
 const aprovadas = ws.subscribe('status:a' + id)

 aprovadas.on('message', (a) => {

     if (a.cont == 0) {
         $('#resultAprovadas .remov').remove()
     } else {
         $('#resultAprovadas').append(a.msg)
     }

     $('#aprovadas').text(a.cont)

     $('#apro').text(' #' + a.cont + '#')
 });
 // ###########mensagem################
 const mensagem = ws.subscribe('status:msg' + id)

 mensagem.on('message', (a) => {
     $('#resultAprovadas').append(a.msg)
     $('#aprovadas').text(a.cont)
 });

 //#######expired##############

 const credexpired = ws.subscribe('status:cex_te' + id)

 credexpired.on('message', (tx) => {
     $('#cex_te_msg').text(tx.msg);
     $('#cex_te_pro').text(tx.pro);

     var dialog = $("#dialog-message").removeClass('hide').dialog({
         modal: true,
         title_html: true,
         buttons: [

             {
                 text: "OK",
                 "class": "btn btn-primary btn-minier",
                 click: function () {
                     //location.reload();
                     $(this).dialog("close");
                 }
             }
         ]
     });
 });



 $("#stop").on('click', function (e) {
     e.preventDefault();

     $("#dialog-confirm").removeClass('hide');
     $("#dialog-confirm").dialog({
         resizable: false,
         width: '320',
         modal: true,

         title_html: false,
         buttons: [
             {
                 html: "<i class='ace-icon fa fa-trash-o bigger-110'></i>&nbsp; Parar Agora",
                 "class": "btn btn-danger btn-minier",
                 "onClick": "parar();",
                 click: function () {

                     $(this).dialog("close");
                 }
             }
             ,
             {
                 html: "<i class='ace-icon fa fa-times bigger-110'></i>&nbsp; Cancelar",
                 "class": "btn btn-minier",
                 click: function () {
                     $(this).dialog("close");
                 }
             }
         ]
     });
 });