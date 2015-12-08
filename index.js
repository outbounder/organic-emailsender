var path = require("path")
var _ = require('lodash')

module.exports = function(plasma, dna){
  this.plasma = plasma
  this.dna = dna

  if(dna.email.transport == "console.log") {
    this.transport = {
      sendMail: function(data, next) {
        console.log(data)
        next()
      }
    }
  } else
  if(dna.email.transport == "devnull") {
    this.transport = {
      sendMail: function(data, next) {
        next()
      }
    }
  } else
  if(dna.email.transport == "plasma") {
    this.transport = {
      sendMail: function(data, next) {
        var chemical = _.extend({}, data, {type: dna.email.options.emitAs })
        if (dna.waitForDelivery) {
          plasma.emit(chemical, next)
        } else {
          plasma.emit(chemical)
          next()
        }
      }
    }
  } else {
    var transportInitPath = dna.email.transport
    if (!isPathFull(transportInitPath)) {
      transportInitPath = path.join(process.cwd(), transportInitPath)
    }
    this.transport = require(transportInitPath)(dna.email.options)
    if (!this.transport || !this.transport.sendMail) {
      throw new Error(dna.email.transport + ' is not valid sendMail transport')
    }
  }

  if(dna.log)
    console.log("sending emails using", dna.email.transport, dna.email.options)

  var self = this
  plasma.on(dna.reactOn || "deliverEmail", function(c, next){
    c.to = c.to || dna.to
    c.from = c.from || dna.from
    self.transport.sendMail(c, function (err, info) {
      switch(true) {
        case !!err:
          console.error(err)
          if (next) return next(err)
        case info instanceof Error:
          console.error(info)
          if (next) return next(info)
      }
      if (dna.log) console.log("email sent successfully", info)
      if (next) next(null, info)
    })
  })
}

var isPathFull = function (value) {
  return value.indexOf("/") === 0 || value.indexOf(":\\")===1
}
