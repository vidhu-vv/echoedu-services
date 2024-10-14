const nodemailer = require('nodemailer');

let transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.GMAIL_ADDRESS,
    pass: process.env.GMAIL_PASS,
  },
});

const carriers = {
  att: '@txt.att.net',
  tmobile: '@tmomail.net',
  verizon: '@vtext.com',
  sprint: '@messaging.sprintpcs.com',
  boost: '@myboostmobile.com',
  cricket: '@sms.mycricket.com',
  metropcs: '@mymetropcs.com',
  tracfone: '@mmst5.tracfone.com',
  uscellular: '@email.us',
  virgin: '@vmobl.com',
  googlefi: '@msg.fi.google.com',
  alltel: '@sms.alltelwireless.com',
  consumer: '@mailmymobile.net',
  republic: '@text.republicwireless.com',
  ting: '@message.ting.com',
  uscellular: '@email.uscc.net',
  mint: '@tmomail.net',
  xfinity: '@vtext.com',
};

module.exports = {
  carriers,
  async sendToNumber(number, carrier, text) {
    const mailContent = {
      from: 'reminders@echo-edu.org',
      to: `${number}${carriers[carrier]}`,
      subject: 'EchoEDU / Reminder',
      text: `${text}`,
    };

    transporter.sendMail(mailContent, (error, info) => {
      if (error) {
        console.log('Error:', error);
      } else {
        console.log('Email sent: ', info.response);
      }
    });
  },
};
