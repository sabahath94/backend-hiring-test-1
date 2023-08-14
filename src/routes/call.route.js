import logger from '../config/logger';
import { errorHandler } from '../middlewares/error';
import { Call, callStatus } from '../models/call'
import express from 'express'
import twilio from 'twilio';
const router = express.Router();
// const accountSid =process.env.TWILIO_ACCOUNT_SID;
// const authToken =process.env.TWILIO_AUTH_TOKEN;
const phoneNumber =process.env.TWILIO_VERIFIED_PHONE_NUMBER
// twilio(accountSid, authToken);
// get the inbound call

router.post('/handle-incoming-call', async (req, res, next) => {
  logger.info('/handle-incoming-call');
  logger.info(JSON.stringify(req.body));
  try {
    const VoiceResponse = new twilio.twiml.VoiceResponse();
    VoiceResponse.say('Press 1 to talk to our representative. Press 2 to leave a voicemail.');
    VoiceResponse.gather({
      numDigits: 1,
      method: "POST",
      action: '/call/process-call'
    }); // get response and redirects to the process-call controller
    res.type('text/xml');
    res.send(VoiceResponse.toString());
  } catch (error) {
    // handle and return error
   errorHandler(error, req, res, next);
  }
});

router.post('/process-call', async (req, res, next) => {
  logger.info('/process-call');
  logger.info(JSON.stringify(req.body));
  const{ 
    Digits: digit,
    From: fromNumber,
    To: toNumber,
    Direction: direction,
  } = req.body;
  try {
    const VoiceResponse = new twilio.twiml.VoiceResponse();

    if (digit === '1') {
      // Forward the call to your personal phone
      VoiceResponse.say('Redirecting to our representative');
      VoiceResponse.dial(phoneNumber);
      res.type('text/xml');
      res.send(VoiceResponse.toString());
    } else if (digit === '2') {
      // Allow caller to leave a voicemail
      VoiceResponse.say('Please leave a voicemail after the beep. Press any key to finish recording.');
      // record voicemail
      VoiceResponse.record({ maxLength: 120, action: '/call/record-voicemail', method: 'POST',  transcribe: true });
      res.type('text/xml');
      res.send(VoiceResponse.toString());
    } else {
      // Handle other options or invalid input
      VoiceResponse.say('Invalid input. Goodbye.');
      VoiceResponse.hangup();
      res.type('text/xml');
      res.send(VoiceResponse.toString());
    }
    // Log the call in the database
    const newCall = new Call({
      from: fromNumber,
      to: toNumber,
      direction,
      callStatus: callStatus.ANSWERED // Assuming the call is answered if user pressed a digit
    });
    await newCall.save();
  } catch (error) {
    // handle and return error
   errorHandler(error, req, res, next);
  }
});


// Handle voicemail recording
router.post('/record-voicemail', (req, res, next) => {
  logger.info('/record-voicemail');
  logger.info(JSON.stringify(req.body));
  try {
    const {
      From: fromNumber,
      To: toNumber,
      RecordingUrl: recordingUrl,
      Direction: direction
    } = req.body;
    // Save the recording URL to the call record in the database

    const VoiceResponse = new twilio.twiml.VoiceResponse();
    VoiceResponse.say('Thank you for leaving a voicemail. Goodbye.');
    VoiceResponse.hangup();
    res.type('text/xml');
    res.send(VoiceResponse.toString());
     // Log the call in the database
     const newCall = new Call({
      from: fromNumber,
      to: toNumber,
      direction,
      callStatus: callStatus.VOICE_RECORDED,
      recordingUrl
    });
  } catch (error) {
    // handle and return error
   errorHandler(error, req, res, next);
  }
});

router.get('/list-calls', async (req, res, next) => {
  try {
    const calls = await Call.find().sort({ timestamp: -1 });
    res.status(200).json(calls);
  } catch (error) {
    errorHandler( 'An error occurred while listing calls.', req, res, next);
  }
});


export default router;
