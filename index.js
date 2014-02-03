var Organel = require("organic").Organel
var nodemailer = require("nodemailer")
var jade = require("jade")
var fs = require("fs")
var path = require("path")
var _ = require("underscore")
var async = require("async")

var pathIsFull = function(value){
  return value.indexOf("/") === 0 || value.indexOf(":\\")===1
}

module.exports = Organel.extend(function(plasma, config){
  Organel.call(this, plasma, config)

  this.templateCache = {}
  if(config.email) {
    if(config.email.transport == "sendmail")
      this.transport = nodemailer.createTransport("sendmail");
    else
      this.transport = nodemailer.createTransport("SMTP",{
        host: config.email.host,
        auth: {
          user: config.email.user,
          pass: config.email.pass
        }
      })
  }
  
  this.on(config.reactOn || "sendEmail", this.sendEmail)
}, {
  sendEmail: function(options, next){
    var self = this
    this.loadTemplate(options, function(err, template){
      if(err) return next(err)

      if(self.config.i18next) {
        var i18n = require('i18next')
        i18n.init(self.config.i18next)
        i18n.setLng(options.locale || self.config.locale)

        var subject
        if(options.subject.key)
          subject = i18n.t(options.subject.key, options.subject.data)
        else
          subject = i18n.t(options.subject)

        options.data.t = i18n.t
      }

      var sendMailOptions = _.extend({
        from: options.from || self.config.from,
        to: options.to || self.config.to,
        subject: subject,
        html: template(options.data)
      }, options.sendMailOptions || {})
      if(self.transport)
        self.transport.sendMail(sendMailOptions, next)
      else
        next(null, sendMailOptions)
    })   
  },
  loadTemplate: function(options, next) {

    var locale = options.locale || this.config.locale
    var template = this.templateCache[options.template+"-"+locale]
    if(template) 
      return next(null, template)
    var root = ""
    if(this.config.root && !pathIsFull(this.config.root))
      root = path.join(process.cwd(), this.config.root)
    else
    if(this.config.root)
      root = this.config.root
    var localizedTemplate = path.join(root, options.template+"-"+locale+".jade")
    var indexTemplate = path.join(root, options.template+".jade")
    var templateTargets = [localizedTemplate, indexTemplate]
    var self = this
    async.detect(templateTargets, fs.exists, function(found){
      if(found) {
        fs.readFile(found, function(err, fileData){
          if(err) return next(err)
          template = jade.compile(fileData, {
            filename: found,
            debug: self.config.debug
          })
          if(self.config.cache)
            self.templateCache[options.template+"-"+locale] = template
          next(null, template)
        })
      } else
        next(new Error("couldn't find none of "+ templateTargets.join(" || ")))
    })
  }
})