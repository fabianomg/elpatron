$('#selectMetodo').change(function () {
    var valor = $('#selectMetodo').val();
    switch (valor) {
        case '1':
            $('#creditos').show();
            $('#dias').hide();
            break;
        case '2':
            $('#dias').show();
            $('#creditos').hide();
            break;

        default:
            $('#dias').hide();
            $('#creditos').hide();
            break;
    }

});