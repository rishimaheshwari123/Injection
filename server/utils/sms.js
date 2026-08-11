/**
 * Normalize phone number to 10 digits
 * @param {string} phone 
 * @returns {string}
 */
export const normalizePhone = (phone) => {
  if (!phone) return '';
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  // If it starts with 91 and has 12 digits, return last 10
  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return cleaned.slice(2);
  }
  // Otherwise, return last 10 digits
  if (cleaned.length > 10) {
    return cleaned.slice(-10);
  }
  return cleaned;
};

/**
 * Sends OTP verification SMS to user
 * @param {string} phone - 10 digit phone number
 * @param {string} otp - 6 digit verification code
 * @returns {Promise<any>}
 */
export const sendOtpSMS = async (phone, otp) => {
  try {
    const normalized = normalizePhone(phone);
    if (normalized.length !== 10) {
      throw new Error('Invalid phone number format. Must be 10 digits.');
    }

    // API number parameter expects prefix "91" (e.g. 91989xxxxxxx)
    const formattedNumber = `91${normalized}`;
    
    // Construct text exactly matching the DLT template:
    // {#var#} is your verification code. For your security, do not share this code. PRLT HEALTH CARE AND RESEARCH SOLUTIONS (OPC)
    const text = `${otp} is your verification code. For your security, do not share this code. PRLT HEALTH CARE AND RESEARCH SOLUTIONS (OPC)`;

    const params = new URLSearchParams({
      apikey: 'Rqi30iCRLkytCEMUFieB6w',
      senderid: 'PRLTHC',
      channel: 'trans',
      DCS: '0',
      flashsms: '0',
      number: formattedNumber,
      text: text,
      route: '29'
    });

    const gatewayUrl = `http://182.18.162.128/api/mt/SendSMS?${params.toString()}`;
    console.log(`Sending SMS to ${formattedNumber} with OTP: ${otp}`);

    const response = await fetch(gatewayUrl);
    const resultText = await response.text();
    
    console.log(`SMS Gateway Response for ${formattedNumber}:`, resultText);
    
    return {
      success: true,
      rawResponse: resultText
    };
  } catch (error) {
    console.error('Error sending OTP SMS:', error.message);
    throw new Error('SMS delivery failed: ' + error.message);
  }
};
