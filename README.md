# organic-emailsender v0.3.1

A simple email sender

## `dna`

    {
      email: {
        transport: String, // "console.log" || "devnull" || "plasma" || <path-to-transport-init>,
        options: Object // passed to transport init
        options: { // used for `plasma` transport only
          emitAs: String
        }
      },
      reactOn: String,
      from: String, default email address
      to: String, default email address
      waitForDelivery: Boolean, default false, blocks reaction callback until email is delivered via `sendmail` || `smtp` || `plasma`,
      log: Boolean, default `false`
    }

### `dna.reactOn` chemical, default `deliverEmail`

    {
      to: String, optional, default `dna.to`
      from: String, optional, default `dna.from`
      subject: String,
      html: String,
      text: String,
      ...
    }

### `dna.email.transport`

When passed a file path it will be used to initialize transport, the module should have the following interface

    module.exports = function (options) {
      return {
        sendMail: function (email, done) {
          // deliver email.from to email.to, email.subject, email.html, email.text
          done(err, result)
        }
      }
    }

#### using nodemailer for transport

1. `dna.email.transport` = `path/to/nodemailer-init-script.js`
2. `path/to/nodemailer-init-script.js`

    module.exports = function (options) {
      return nodemailer.createTransport(options)
    }
