'use strict'

const Route = use('Route')
Route.get('/', 'PageviewController.showUser').middleware('auth')

//Route.on('/login').render('login')
Route.get('/admin', 'PageviewController.showAdmin').middleware('auth')
Route.get('/caduser', 'PageviewController.showCaduser').middleware('auth')
Route.get('/viewusers', 'PageviewController.showUsers').middleware('auth')
Route.on('/cadcaptcha').render('captcha').middleware('auth')
Route.on('/cadproxy').render('proxy').middleware('auth')
Route.on('/cadsite').render('configsite').middleware('auth')

//Route.on('/').render('home').as('home').middleware(['auth'])

Route.post('/register', 'UserController.register').as('register')
Route.post('/updateuser', 'UserController.updateUser').as('updateuser')

//Route.post('register', 'Auth/RegisterController.register').as('register')
//Route.get('register/confirm/:token', 'Auth/RegisterController.confirmEmail')
Route.get('login', 'Auth/LoginController.showLoginForm')//.middleware([
// 'authenticated'
//])
Route.post('login', 'Auth/LoginController.login').as('login')
Route.get('logout', 'Auth/AuthenticatedController.logout')
Route.post('password/email', 'Auth/PasswordResetController.sendResetLinkEmail')
Route.get('password/reset/:token', 'Auth/PasswordResetController.showResetForm')
Route.post('password/reset', 'Auth/PasswordResetController.reset').as('resetpass')

Route.post('/config', 'ConfigController.store').as('config')

Route.post('/cadcaptcha', 'ConfigController.cadCaptcha').as('cadcaptcha')
Route.post('/cadproxy', 'ConfigController.cadProxy').as('cadproxy')

//d20eab822faf0d858c62d43d002148b4
Route.get('/gettable', 'UserController.ReturnUsers')

Route.post('/teste', 'BotController.start').as('start')
