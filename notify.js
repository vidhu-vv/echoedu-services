const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_KEY);

const carriers = {
  att: "@txt.att.net",
  tmobile: "@tmomail.net",
  verizon: "@vtext.com",
  sprint: "@messaging.sprintpcs.com",
  boost: "@myboostmobile.com",
  cricket: "@sms.mycricket.com",
  metropcs: "@mymetropcs.com",
  tracfone: "@mmst5.tracfone.com",
  uscellular: "@email.us",
  virgin: "@vmobl.com",
  google: "@msg.fi.google.com",
};

module.exports = {
  carriers,
  async sendToNumber(number, carrier, text) {
    // resend logic
    const { data, error } = await resend.emails.send({
      from: "reminders@echo-edu.org",
      to: `${number}${carriers[carrier]}`,
      subject: "EchoEDU / Reminder",
      text: `${text}`,
    });

    if (error) {
      return console.error({ error });
    }

    console.log({ data });
  },
};
