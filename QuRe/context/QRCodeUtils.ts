import { QRCodeItem, QRType, LinkQRCodeItem, EmailQRCodeItem, CallQRCodeItem, SMSQRCodeItem, VCardQRCodeItem, WhatsAppQRCodeItem, TextQRCodeItem } from './QRCodeTypes';

// Generate a unique ID for a QR code
export const generateQRCodeId = (): string => {
  return 'qr_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
};

// Convert a QR code item to a raw value string for the QR code
export const qrCodeItemToValue = (item: QRCodeItem): string => {
  switch (item.type) {
    case 'link':
      return (item as LinkQRCodeItem).data.url;
    
    case 'email': {
      const emailItem = item as EmailQRCodeItem;
      let emailUrl = `mailto:${emailItem.data.email}`;
      
      const params = [];
      if (emailItem.data.subject) params.push(`subject=${encodeURIComponent(emailItem.data.subject)}`);
      if (emailItem.data.body) params.push(`body=${encodeURIComponent(emailItem.data.body)}`);
      
      if (params.length > 0) {
        emailUrl += `?${params.join('&')}`;
      }
      
      return emailUrl;
    }
    
    case 'call': {
      const callItem = item as CallQRCodeItem;
      let phoneNumber = callItem.data.phoneNumber;
      if (callItem.data.countryCode) {
        phoneNumber = `+${callItem.data.countryCode}${phoneNumber}`;
      }
      return `tel:${phoneNumber}`;
    }
    
    case 'sms': {
      const smsItem = item as SMSQRCodeItem;
      let phoneNumber = smsItem.data.phoneNumber;
      if (smsItem.data.countryCode) {
        phoneNumber = `+${smsItem.data.countryCode}${phoneNumber}`;
      }
      
      let smsUrl = `sms:${phoneNumber}`;
      if (smsItem.data.message) {
        smsUrl += `?body=${encodeURIComponent(smsItem.data.message)}`;
      }
      
      return smsUrl;
    }
    
    case 'vcard': {
      const vcardItem = item as VCardQRCodeItem;
      const vcardData = vcardItem.data;
      
      const vcardLines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${vcardData.firstName} ${vcardData.lastName}`,
        `N:${vcardData.lastName};${vcardData.firstName};;;`,
      ];
      
      if (vcardData.phoneNumber) {
        vcardLines.push(`TEL;TYPE=WORK:${vcardData.phoneNumber}`);
      }
      
      if (vcardData.mobileNumber) {
        vcardLines.push(`TEL;TYPE=CELL:${vcardData.mobileNumber}`);
      }
      
      if (vcardData.fax) {
        vcardLines.push(`TEL;TYPE=FAX:${vcardData.fax}`);
      }
      
      if (vcardData.email) {
        vcardLines.push(`EMAIL:${vcardData.email}`);
      }
      
      if (vcardData.website) {
        vcardLines.push(`URL:${vcardData.website}`);
      }
      
      if (vcardData.company) {
        vcardLines.push(`ORG:${vcardData.company}`);
      }
      
      if (vcardData.jobTitle) {
        vcardLines.push(`TITLE:${vcardData.jobTitle}`);
      }
      
      if (vcardData.address || vcardData.city || vcardData.postCode || vcardData.country) {
        vcardLines.push(`ADR:;;${vcardData.address || ''};${vcardData.city || ''};;${vcardData.postCode || ''};${vcardData.country || ''}`);
      }
      
      vcardLines.push('END:VCARD');
      
      return vcardLines.join('\n');
    }
    
    case 'whatsapp': {
      const whatsappItem = item as WhatsAppQRCodeItem;
      let phoneNumber = whatsappItem.data.phoneNumber;
      if (whatsappItem.data.countryCode) {
        phoneNumber = `${whatsappItem.data.countryCode}${phoneNumber}`;
      }
      
      let whatsappUrl = `https://wa.me/${phoneNumber}`;
      if (whatsappItem.data.message) {
        whatsappUrl += `?text=${encodeURIComponent(whatsappItem.data.message)}`;
      }
      
      return whatsappUrl;
    }
    
    case 'text':
      return (item as TextQRCodeItem).data.content;
      
    default:
      return '';
  }
};

// Parse a raw QR code value back into structured data based on type
export const parseQRCodeValue = (type: QRType, value: string): any => {
  switch (type) {
    case 'link':
      return { url: value || 'https://' };
    
    case 'email': {
      const mailtoPattern = /^mailto:([^?]+)(?:\?(?:subject=([^&]*))?(?:&body=([^&]*))?)?$/;
      const matches = value.match(mailtoPattern);
      
      return {
        email: matches ? decodeURIComponent(matches[1] || '') : '',
        subject: matches && matches[2] ? decodeURIComponent(matches[2]) : '',
        body: matches && matches[3] ? decodeURIComponent(matches[3]) : ''
      };
    }
    
    case 'call': {
      const phonePattern = /^tel:(\+?)([0-9]+)$/;
      const matches = value.match(phonePattern);
      
      if (matches) {
        const hasPlus = matches[1] === '+';
        const number = matches[2];
        
        // Simple heuristic: If the number starts with a country code (1-3 digits)
        // and the number is longer than 10 digits, extract the country code
        if (hasPlus && number.length > 10) {
          const countryCode = number.substring(0, number.length > 12 ? 3 : (number.length > 11 ? 2 : 1));
          const phoneNumber = number.substring(countryCode.length);
          return {
            countryCode,
            phoneNumber
          };
        }
        
        return { phoneNumber: number };
      }
      
      return { phoneNumber: '' };
    }
    
    case 'sms': {
      const smsPattern = /^sms:(\+?)([0-9]+)(?:\?body=(.*))?$/;
      const matches = value.match(smsPattern);
      
      if (matches) {
        const hasPlus = matches[1] === '+';
        const number = matches[2];
        const message = matches[3] ? decodeURIComponent(matches[3]) : '';
        
        // Similar country code heuristic as call
        if (hasPlus && number.length > 10) {
          const countryCode = number.substring(0, number.length > 12 ? 3 : (number.length > 11 ? 2 : 1));
          const phoneNumber = number.substring(countryCode.length);
          return {
            countryCode,
            phoneNumber,
            message
          };
        }
        
        return { 
          phoneNumber: number,
          message
        };
      }
      
      return { phoneNumber: '', message: '' };
    }
    
    case 'vcard': {
      const result = {
        firstName: '',
        lastName: '',
        phoneNumber: '',
        mobileNumber: '',
        email: '',
        website: '',
        company: '',
        jobTitle: '',
        fax: '',
        address: '',
        city: '',
        postCode: '',
        country: ''
      };
      
      const lines = value.split(/\r\n|\r|\n/);
      
      for (const line of lines) {
        if (line.startsWith('FN:')) {
          const fullName = line.substring(3).split(' ');
          result.firstName = fullName[0] || '';
          result.lastName = fullName.slice(1).join(' ') || '';
        } else if (line.startsWith('N:')) {
          const nameParts = line.substring(2).split(';');
          if (nameParts.length >= 2) {
            result.lastName = nameParts[0] || '';
            result.firstName = nameParts[1] || '';
          }
        } else if (line.startsWith('TEL;TYPE=CELL:')) {
          result.mobileNumber = line.substring(14);
        } else if (line.startsWith('TEL;TYPE=WORK:')) {
          result.phoneNumber = line.substring(14);
        } else if (line.startsWith('TEL;TYPE=FAX:')) {
          result.fax = line.substring(13);
        } else if (line.startsWith('EMAIL:')) {
          result.email = line.substring(6);
        } else if (line.startsWith('URL:')) {
          result.website = line.substring(4);
        } else if (line.startsWith('ORG:')) {
          result.company = line.substring(4);
        } else if (line.startsWith('TITLE:')) {
          result.jobTitle = line.substring(6);
        } else if (line.startsWith('ADR:')) {
          const addressParts = line.substring(4).split(';');
          if (addressParts.length >= 7) {
            result.address = addressParts[2] || '';
            result.city = addressParts[3] || '';
            result.postCode = addressParts[5] || '';
            result.country = addressParts[6] || '';
          }
        }
      }
      
      return result;
    }
    
    case 'whatsapp': {
      const whatsappPattern = /^https:\/\/wa\.me\/([0-9]+)(?:\?text=(.*))?$/;
      const matches = value.match(whatsappPattern);
      
      if (matches) {
        const number = matches[1];
        const message = matches[2] ? decodeURIComponent(matches[2]) : '';
        
        // Similar country code heuristic
        if (number.length > 10) {
          const countryCode = number.substring(0, number.length > 12 ? 3 : (number.length > 11 ? 2 : 1));
          const phoneNumber = number.substring(countryCode.length);
          return {
            countryCode,
            phoneNumber,
            message
          };
        }
        
        return { 
          phoneNumber: number,
          message
        };
      }
      
      return { phoneNumber: '', message: '' };
    }
    
    case 'text':
      return { content: value || '' };
      
    default:
      return {};
  }
};

// Create a new QR code item
export const createQRCodeItem = (
  type: QRType, 
  data: any, 
  label: string = '', 
  styleOptions = {
    color: '#000000',
    backgroundColor: '#FFFFFF',
    enableLinearGradient: false,
    quietZone: 10,
    ecl: 'M' as 'L' | 'M' | 'Q' | 'H'
  },
  isPrimary: boolean = false
): QRCodeItem => {
  const id = generateQRCodeId();
  const now = new Date().toISOString();
  
  const baseItem = {
    id,
    type,
    label: label || `${type.charAt(0).toUpperCase()}${type.slice(1)} QR Code`,
    styleOptions,
    createdAt: now,
    updatedAt: now,
    isPrimary,
    data
  };
  
  switch (type) {
    case 'link':
      return {
        ...baseItem,
        type: 'link',
        data: {
          url: data.url || 'https://'
        }
      } as LinkQRCodeItem;
      
    case 'email':
      return {
        ...baseItem,
        type: 'email',
        data: {
          email: data.email || '',
          subject: data.subject || '',
          body: data.body || ''
        }
      } as EmailQRCodeItem;
      
    case 'call':
      return {
        ...baseItem,
        type: 'call',
        data: {
          phoneNumber: data.phoneNumber || '',
          countryCode: data.countryCode || ''
        }
      } as CallQRCodeItem;
      
    case 'sms':
      return {
        ...baseItem,
        type: 'sms',
        data: {
          phoneNumber: data.phoneNumber || '',
          countryCode: data.countryCode || '',
          message: data.message || ''
        }
      } as SMSQRCodeItem;
      
    case 'vcard':
      return {
        ...baseItem,
        type: 'vcard',
        data: {
          firstName: data.firstName || '',
          lastName: data.lastName || '',
          phoneNumber: data.phoneNumber || '',
          mobileNumber: data.mobileNumber || '',
          email: data.email || '',
          website: data.website || '',
          company: data.company || '',
          jobTitle: data.jobTitle || '',
          fax: data.fax || '',
          address: data.address || '',
          city: data.city || '',
          postCode: data.postCode || '',
          country: data.country || ''
        }
      } as VCardQRCodeItem;
      
    case 'whatsapp':
      return {
        ...baseItem,
        type: 'whatsapp',
        data: {
          phoneNumber: data.phoneNumber || '',
          countryCode: data.countryCode || '',
          message: data.message || ''
        }
      } as WhatsAppQRCodeItem;
      
    case 'text':
      return {
        ...baseItem,
        type: 'text',
        data: {
          content: data.content || ''
        }
      } as TextQRCodeItem;
      
    default:
      throw new Error(`Unsupported QR code type: ${type}`);
  }
};