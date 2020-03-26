'use strict'
let url = null
let users;
let protrocol = window.location.protocol;
if (protrocol == 'http:') {
    url = 'ws://' + window.location.host;
} else {
    url = 'wss://' + window.location.host
}

const ws = adonis.Ws(url).connect();
ws.on('open', () => {
    $('.connection-status').addClass('connected')

    subscribeToChannel(window.id)
})
ws.on('close', () => {
    $('.connection-status').removeClass('connected')
    desconectd();
})
ws.on('error', () => {
    console.log('1teste')
    $('.connection-status').removeClass('connected')
    desconectd();
})

function subscribeToChannel(id) {
    users = ws.subscribe('users:' + window.id)

    users.on('error', () => {
        $('.connection-status').removeClass('connected')
        desconectd();
    })

    users.on('total', (message) => {
        $('#carregadas').text(message)
    })
    users.on('status', (message) => {
        $('#status').text(message)
        if (message == 'Processando dados...') {
            $('#cstatus').addClass('fa-spin')
        }
        if (message == 'Aguardando...') {
            $('#cstatus').removeClass('fa-spin')
        }
    })
    users.on('atividade', (message) => {
        $('#atividade').text(message)

    })
    users.on('aprovados', (message) => {

        let a = $('#aprovados').text();
        $('#aprovados').text(parseInt(a) + parseInt(message))

    })
    users.on('reprovados', (message) => {

        let r = $('#reprovados').text();
        $('#reprovados').text(parseInt(r) + parseInt(message))

    })
    users.on('testados', (message) => {

        let t = $('#testados').text();
        $('#testados').text(parseInt(t) + parseInt(message))

    })


    users.on('ready', () => {
        users.emit('users', id)
    })
}
;

function desconectd() {
    const start = $("button[id='start']");
    start.prop('disabled', 'true')
    const stop = $("button[id='stop']");
    stop.prop('disabled', 'true')
    //let msg = '<div style="margin-top:5px;" class="alert alert-danger col-md-4 col-md-offset-4" role="alert">Websocket Deconectado</div>'
    //$('#menssagem').html(msg)
}

/*
canaluser.on('message', (result) => {
    switch (result.type) {
        case 'total':
            $('#carregadas').text(result.msg)
            break;
        case 'status':

            let teste = '<tr role="row" class="odd">' +
                '<td class="center"> <label class="pos-rel"><input type="checkbox" class="ace"> <span class="lbl"></span> </label></td>' +
                '<td class=""><a href="#">6504867262787880|06|2023|000</a></td>' +
                ' <td class="hidden-480 center">' +
                '<span class="label label-sm label-success">APROVADO</span>' +
                '<span class="label label-sm label-info">ELPATRON</span>' +
                '</td> </tr>'


            $('#cstatus').addClass('fa-spin')
            $('#status').text(result.msg)
            const buttons = $("button[id='start']");
            buttons.prop('disabled', 'true')
            const buttons2 = $("button[id='stop']");
            buttons2.prop('disabled', false)
            break;
        case 'statusfim':
            $('#cstatus').removeClass('fa-spin')
            $('#status').text(result.msg)
            const startfim = $("button[id='start']");
            startfim.prop('disabled', false)
            const stopfim = $("button[id='stop']");
            stopfim.prop('disabled', true)
            break;
        case 'atividade':
            $('#atividade').text(result.msg)
            break;
        case 'card':
            if (result.msg == 'valid') {

                let a = $('#aprovadas').text();
                let t = $('#testadas').text();

                $('#aprovadas').text(parseInt(a) + 1)
                $('#testadas').text(parseInt(t) + 1)
            }
            if (result.msg == 'denied') {
                let r = $('#reprovadas').text();
                let t = $('#testadas').text();

                $('#reprovadas').text(parseInt(r) + 1)
                $('#testadas').text(parseInt(t) + 1)
            }

            break;
        case 'aprovado':
            let data = {
                "userID": userid,
            }
            console.log(data)
            listtrades(userid)
            break;
        case 'reprovado':
            $('#repro').append(result.msg)
            break;
        case 'saldo':
            $('#creditos').text(result.msg)
            break;
        default:
            break;
    }
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
});
*/