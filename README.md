# organic-emailsender v0.1.0

A simple email sender with jade and i18next templates.

## DNA

    {
      email: {
        transport: String, // "sendmail" || "console.log" || "smtp" || "devnull" || "plasma",
        options: { // used for `smtp` transport only
          port: Number,
          host: String,
          auth: {
            user: String,
            pass: String
          }
        },
        options: { // used for `plasma` transport only
          emitAs: String
        }
      },
      root: String,
      cache: Boolean,
      debug: Boolean,
      i18next: Object, optional directly passed to i18next
      reactOn: String, default "sendEmail",
      from: String, default email address
      to: String, default email address
      locale: String, optional
    }

## Reaction

With chemical:

    {
      to: String, optional if config.toEmailAddress is set
      from: String, optional if config.fromEmailAddress is set
      template: String,
      locale: String, optional,
      sendMailOptions: Object, optional,
      data: Object
    }

* Loads a jade template by `config.root`+ `template` + (optionally -`locale`) + .jade path
* renders the template with `data`
* sends the resulted email to given email address

## `template` property

  * can be a path to jade template file
  * can be a path to directory, rendering final template html will be via [email-templates](https://github.com/niftylettuce/node-email-templates)
