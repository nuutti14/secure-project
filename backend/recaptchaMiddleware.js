import axios from 'axios';
import asyncHandler from 'express-async-handler';
import { configDotenv } from 'dotenv';

// Load environment variables from .env to keep secrets out of source code.
configDotenv();

//The function verifies the captcha key by calling the captcha API
const verifyCaptcha = asyncHandler(async (req, res, next) => {
  const { captcha } = req.body;
  if (!captcha) {
    return res.status(400).json({ message: 'Please complete the CAPTCHA' });
  }
  const secretKey = process.env.CAPTCHA_SECRET_KEY;
  try {
    const response = await axios.post(
      `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`
    );
    if (response.data.success) {
      next();
    } else {
      return res.status(400).json({ message: 'CAPTCHA verification failed' });
    }
  } catch (error) {
    return res.status(500).json({ message: 'CAPTCHA verification error' });
  }
});

export default verifyCaptcha;