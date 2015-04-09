var nodemailer = require("nodemailer")
var jade = require("jade")
var fs = require("fs")
var path = require("path")
var _ = require("underscore")
var async = require("async")

var pathIsFull = function(value){
  return value.indexOf("/") === 0 || value.indexOf(":\\")===1
}

module.exports = function(plasma, dna){
  this.plasma = plasma
  this.dna = dna
  this.templateCache = {}
  if(dna.email) {
    if(dna.email.transport == "sendmail")
      this.transport = nodemailer.createTransport("sendmail");
    else
    if(dna.email.transport == "smtp")
      this.transport = nodemailer.createTransport("SMTP", dna.email.options)
    else
    if(dna.email.transport == "console.log") {
      this.transport = {
        sendMail: function(options, next) {
          console.log(options)
          next()
        }
      }
    } else
    if(dna.email.transport == "devnull") {
      this.transport = {
        sendMail: function(options, next) {
          next()
        }
      }
    } else
      throw new Error("unknown transport")
  }

  if(dna.log && this.transport)
    console.log("sending emails using", dna.email.transport, dna.email.options)
  
  var self = this
  plasma.on(dna.reactOn || "sendEmail", function(c, next){
    self.sendEmail(c, next)
  })
}

module.exports.prototype.sendEmail = function(options, next){
  var self = this
  this.loadTemplate(options, function(err, template){
    if(err) return next(err)
  
    var subject = options.subject

    if(self.dna.i18next) {
      var i18n = require('i18next')
      i18n.init(self.dna.i18next)
      if(options.locale || self.dna.locale)
        i18n.setLng(options.locale || self.dna.locale)
      
      if(options.subject)
        if(options.subject.key)
          subject = i18n.t(options.subject.key, options.subject.data)
        else
          subject = i18n.t(options.subject)

      options.data = options.data || {}
      options.data.t = i18n.t
    }

    var sendMailOptions = _.extend({
      from: options.from || self.dna.from,
      to: options.to || self.dna.to,
      subject: subject,
      html: template(options.data)
    }, options.sendMailOptions || {})

    if(self.transport)
      self.transport.sendMail(sendMailOptions, next)
    else
      next(null, sendMailOptions)
  })   
}

module.exports.prototype.loadTemplate = function(options, next) {
  var locale = options.locale || this.dna.locale
  var template = this.templateCache[options.template+"-"+locale]
  if(template) 
    return next(null, template)
  var root = ""
  if(this.dna.root && !pathIsFull(this.dna.root))
    root = path.join(process.cwd(), this.dna.root)
  else
  if(this.dna.root)
    root = this.dna.root
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
          debug: self.dna.debug
        })
        if(self.dna.cache)
          self.templateCache[options.template+"-"+locale] = template
        next(null, template)
      })
    } else
      next(new Error("couldn't find none of "+ templateTargets.join(" || ")))
  })
}
