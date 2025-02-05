// src/types/data.types.ts

export interface PlanDetails {
    name: string;        // Name of the data plan (e.g., "2GB Daily Plan")
    dataAmount: string;  // Amount of data (e.g., "2GB")
    validity: string;    // Validity period (e.g., "24 hours")
    price: number;       // Price of the plan in the local currency
  }
  
  export interface DataPurchaseValidation {
    isValid: boolean;            // Whether the purchase is valid
    validationMessage: string;   // Message describing the validation result
    planDetails?: PlanDetails;   // Optional details about the plan
    estimatedDelivery?: string;  // Optional estimated delivery time (ISO format)
  }