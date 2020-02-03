'use strict'

const Route = use('Route')
Route.get('/', 'PageviewController.showUser').middleware('auth')

//Route.on('/login').render('login')
Route.get('/admin', 'PageviewController.showAdmin').middleware('auth')
Route.on('/caduser').render('caduser').middleware('auth')
Route.on('/viewusers').render('viewusers').middleware('auth')
Route.on('/cadcaptcha').render('captcha').middleware('auth')
Route.on('/cadproxy').render('proxy').middleware('auth')
Route.on('/cadsite').render('configsite').middleware('auth')

//Route.on('/').render('home').as('home').middleware(['auth'])

Route.post('/register', 'UserController.register').as('register')

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


Route.get('gettable', 'UserController.ReturnUsers')