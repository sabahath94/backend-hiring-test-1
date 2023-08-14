import { Schema, model } from 'mongoose'

const callSchema = new Schema({
  from: String,
  to: String,
  callStatus: String,
  direction: String,
  callDuration: Number,
  voicemailUrl: String,
  timestamp: { type: Date, default: Date.now }
});

export const Call = model('Call', callSchema);

