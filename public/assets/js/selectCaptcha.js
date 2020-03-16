$('#captcha').change(function () {
    var valor = $('#captcha').val();
    switch (valor) {
        case '1':
            $('#twocaptcha').show();
            $('#deathbycaptcha').hide();
            break;
        case '2':
            $('#deathbycaptcha').show();
            $('#twocaptcha').hide();
            break;

        default:
            $('#deathbycaptcha').hide();
            $('#twocaptcha').hide();
            break;
    }

});