const Nexmo = require("nexmo");
const otp = Math.floor(1000 + Math.random() * 9000);

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_APIKEY,
  apiSecret: process.env.NEXMO_APISECRET,
});

const sms = (user) => {
  const from = "Vonage APIs";
  const to = `${user.phoneNumber}`;
  const text = `Dear ${user.name}
    We Received a request to Change Your Password
    Your OTP:${otp}
    Please Go to App And Verify OTP`;

  nexmo.message.sendSms(from, to, text, (error, response) => {
    if (error) {
      throw new Error(error);
    } else {
      console.log("Sms sent");
    }
  });
};

module.exports = {
  sms,
  otp,
};
