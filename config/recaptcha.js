const Env = use('Env')

module.exports = {
  siteKey: Env.get('RECAPTCHA_SITE_KEY'),
  
  secretKey: Env.get('RECAPTCHA_SECRET_KEY'),
  client: true
}