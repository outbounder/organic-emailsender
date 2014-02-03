describe("index", function(){
  var organic = require("organic")
  var EmailSender = require("../index")

  it("sends email", function(next){
    var instance = new EmailSender(new organic.Plasma(), {
      from: "me",
      root: __dirname+"/data"
    })
    instance.sendEmail({
      template: "email",
      to: "somebody",
      subject: "test"
    }, function(err, options){
      expect(options.from).toBe("me")
      expect(options.to).toBe("somebody")
      expect(options.html).toContain("sample")
      next()
    })
  })
})