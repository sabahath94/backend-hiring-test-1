import request from 'supertest'
import app from '../app'
import setupTestDB from './utils/setupTestDB'

setupTestDB()
  describe('Twilio API Tests', () => {
    it('should respond with instructions on /handle-incoming-call', async () => {
      const response = await request(app).post('/call/handle-incoming-call');
      expect(response.status).toBe(200);
      expect(response.text).toContain('Press 1 to talk to our representative.');
      expect(response.text).toContain('Press 2 to leave a voicemail.');
    });
  
    it('should forward call to personal number on /process-call (digit 1)', async () => {
      const response = await request(app).post('/call/process-call').send({ Digits: '1' });
      expect(response.status).toBe(200);
      // Assuming you have appropriate TwiML in your server response
      expect(response.text).toContain('Dial');
      expect(response.text).toContain('Redirecting to our representative');
    });
  
    it('should allow voicemail recording on /process-call (digit 2)', async () => {
      const response = await request(app).post('/call/process-call').send({ Digits: '2' });
      expect(response.status).toBe(200);
      // Assuming you have appropriate TwiML in your server response
      expect(response.text).toContain('Please leave a voicemail');
    });
  
    it('should handle invalid input on /process-call', async () => {
      const response = await request(app).post('/call/process-call').send({ Digits: '3' });
      expect(response.status).toBe(200);
      // Assuming you have appropriate TwiML in your server response
      expect(response.text).toContain('Invalid input. Goodbye.');
    });
  
    it('should handle voicemail recording on /record-voicemail', async () => {
      const response = await request(app).post('/call/record-voicemail');
      expect(response.status).toBe(200);
      // Assuming you have appropriate TwiML in your server response
      expect(response.text).toContain('Thank you for leaving a voicemail.');
    });
  
    // Add more test cases as needed
  });
  