const nodemailer = require('nodemailer');
const { google } = require('googleapis');

const { CLIENT_ID, CLIENT_SECRET, REDIRECT_URI, REFRESH_TOKEN, USER, TO } =
  process.env;

const oAut2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI,
);

oAut2Client.setCredentials({ refresh_token: REFRESH_TOKEN });

const getTransporter = async () => {
  const accessToken = await oAut2Client.getAccessToken();
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    host: 'smtp.gmail.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      type: 'OAuth2',
      user: USER,
      clientId: CLIENT_ID,
      clientSecret: CLIENT_SECRET,
      refreshToken: REFRESH_TOKEN,
      accessToken,
    },
  });
  return transporter;
};

const sendMail = async (name, email) => {
  try {
    const transporter = await getTransporter();
    const mailOptions = {
      from: { name, address: email }, // sender address
      to: [TO], // list of receivers
      subject: 'Thanks for joining Task App.', // Subject line
      text: `Hello Samiul, New account has been created in your app using this name: ${name} and mail: ${email}. This mail is sending from node express server to you via nodemailer.`, // plain text body
      //   html: '<b>Hello world?</b>', // html body
    };
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
};

const sendCancellationMail = async (name, email) => {
  try {
    const transporter = await getTransporter();
    const mailOptions = {
      from: { name, address: email },
      to: TO,
      subject: 'Cancelling Task App subscription.',
      text: `Hello Samiul, This account named ${name} and mail: ${email} has unsubscribed from your Task-App. This mail is sending from node express server to you via nodemailer.`,
    };
    const result = await transporter.sendMail(mailOptions);
    return result;
  } catch (error) {
    return error;
  }
};

module.exports = { sendMail, sendCancellationMail };
