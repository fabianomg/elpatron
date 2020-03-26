function list() {

    $('#list').DataTable({

        details: {
            renderer: function (api, rowIdx) {
                var data = api.cells(rowIdx, ':hidden').eq(0).map(function (cell) {
                    var header = $(api.column(cell.column).header());
                    return '<p style="color:#00A">' + header.text() + ' : ' + api.cell(cell).data() + '</p>';
                }).toArray().join('');

                return data ? $('<table/>').append(data) : false;
            }
        },
        "language": {
            lengthMenu: "Mostrando _MENU_ registros por página",
            zeroRecords: "Não foram encontrados cartões testados aguarde. os cartões serem verificados",
            info: "Mostrando página _PAGE_ de _PAGES_",
            infoEmpty: "Nenhum registro disponível",
            infoFiltered: "(filtrado de _MAX_ registros no total)",
            search: "Pesquisar:",
            processing: "Aguarde! Carregando Dados...",
            paginate: {
                first: "Primeiro",
                last: "Ultimo",
                next: "Próximo",
                previous: "Anterior"
            }
        },

        destroy: true,
        processing: false,
        responsive: true,

        columns: [
            {
                data: "cards"
            },
            {
                data: "status"
            }

        ]
    });
}