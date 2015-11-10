module.exports = function (options) {
  return {
    sendMail: function (email, done) {
      options(email, done)
    }
  }
}
