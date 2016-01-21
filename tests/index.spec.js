describe("index", function () {
  var Plasma = require("organic-plasma")
  var EmailSender = require("../index")

  it("sends email via plasma", function (next) {
    var plasma = require('organic-plasma-feedback')(new Plasma())
    var instance = new EmailSender(plasma, {
      from: "me",
      email: {
        transport: "plasma",
        options: {
          emitAs: "transportEmail"
        }
      }
    })
    plasma.on("transportEmail", function (email) {
      expect(email.type).toBe("transportEmail")
      expect(email.from).toBe("me")
      expect(email.to).toBe("somebody")
      next()
    })
    plasma.emit({
      type: "deliverEmail",
      to: "somebody",
      subject: "test"
    })
  })

  it("sends email custom transport", function (next) {
    var plasma = require('organic-plasma-feedback')(new Plasma())
    var instance = new EmailSender(plasma, {
      from: "me",
      email: {
        transport: 'tests/transport.js',
        options: function (email, done) {
          expect(email.type).toBe("deliverEmail")
          expect(email.from).toBe("me")
          expect(email.to).toBe("somebody")
          done()
        }
      }
    })
    plasma.emit({
      type: "deliverEmail",
      to: "somebody",
      subject: "test"
    }, next)
  })
})
