// Define QR code types
export type QRType = 'link' | 'email' | 'call' | 'sms' | 'vcard' | 'whatsapp' | 'text';

// Base QR Code Item (common properties)
export interface BaseQRCodeItem {
  id: string;                 // Unique identifier 
  type: QRType;               // Type of QR code
  label: string;              // User-friendly label
  createdAt: string;          // Creation timestamp
  updatedAt: string;          // Last update timestamp
  isPrimary: boolean;         // Whether this is the primary QR code
  
  // Styling options
  styleOptions: {
    color: string;            // QR code color
    backgroundColor: string;  // Background color
    enableLinearGradient: boolean;
    linearGradient?: [string, string];  // Start and end colors for gradient
    quietZone: number;        // Margin around QR code
    ecl: 'L' | 'M' | 'Q' | 'H'; // Error correction level
  };
}

// Link QR Code
export interface LinkQRCodeItem extends BaseQRCodeItem {
  type: 'link';
  data: {
    url: string;
  };
}

// Email QR Code
export interface EmailQRCodeItem extends BaseQRCodeItem {
  type: 'email';
  data: {
    email: string;
    subject?: string;
    body?: string;
  };
}

// Call QR Code
export interface CallQRCodeItem extends BaseQRCodeItem {
  type: 'call';
  data: {
    phoneNumber: string;
    countryCode?: string;
  };
}

// SMS QR Code
export interface SMSQRCodeItem extends BaseQRCodeItem {
  type: 'sms';
  data: {
    phoneNumber: string;
    countryCode?: string;
    message?: string;
  };
}

// VCard QR Code (contact information)
export interface VCardQRCodeItem extends BaseQRCodeItem {
  type: 'vcard';
  data: {
    firstName: string;
    lastName: string;
    phoneNumber?: string;
    mobileNumber?: string;
    email?: string;
    website?: string;
    company?: string;
    jobTitle?: string;
    fax?: string;
    address?: string;
    city?: string;
    postCode?: string;
    country?: string;
  };
}

// WhatsApp QR Code
export interface WhatsAppQRCodeItem extends BaseQRCodeItem {
  type: 'whatsapp';
  data: {
    phoneNumber: string;
    countryCode?: string;
    message?: string;
  };
}

// Text QR Code
export interface TextQRCodeItem extends BaseQRCodeItem {
  type: 'text';
  data: {
    content: string;
  };
}

// Union type of all QR code types
export type QRCodeItem = 
  | LinkQRCodeItem 
  | EmailQRCodeItem 
  | CallQRCodeItem 
  | SMSQRCodeItem 
  | VCardQRCodeItem 
  | WhatsAppQRCodeItem 
  | TextQRCodeItem;

// Main QR code state structure
export interface QRCodeState {
  qrCodes: Record<string, QRCodeItem>;  // Dictionary of QR codes by ID
  isLoading: boolean;                   // Loading state
  error: string | null;                 // Error state
}