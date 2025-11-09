"use client";
import { useMutation } from "@tanstack/react-query";
import { loginRequest, saveAuth, LoginResponse } from "../lib/authClient";

type LoginInput = {
  phone: string;
  pin: string;
};

// Input validation function
function validateLoginInput(input: LoginInput): void {
  if (!input.phone || typeof input.phone !== 'string') {
    throw new Error("Phone number is required");
  }
  
  if (!input.pin || typeof input.pin !== 'string') {
    throw new Error("PIN is required");
  }
  
  // Sanitize phone number (remove spaces, validate format)
  const cleanPhone = input.phone.trim().replace(/\s/g, '');
  if (!/^\+?[1-9]\d{1,14}$/.test(cleanPhone)) {
    throw new Error("Invalid phone number format");
  }
  
  // Validate PIN format
  if (!/^\d{4,6}$/.test(input.pin.trim())) {
    throw new Error("PIN must be 4-6 digits");
  }
}

export function useAuthLogin() {
  return useMutation<LoginResponse, Error, LoginInput>({
    mutationFn: async (input: LoginInput) => {
      try {
        // Validate input before making request
        validateLoginInput(input);
        
        // Sanitize inputs
        const sanitizedInput = {
          phone: input.phone.trim().replace(/\s/g, ''),
          pin: input.pin.trim()
        };
        
        const resp = await loginRequest(sanitizedInput);
        
        // Validate response structure
        if (!resp || typeof resp !== 'object') {
          throw new Error("Invalid response from server");
        }
        
        if (!resp.accessToken || typeof resp.accessToken !== 'string') {
          throw new Error("Invalid access token received");
        }
        
        // Additional token validation
        if (resp.accessToken.length < 10) {
          throw new Error("Invalid access token format");
        }
        
        // Persist authentication data securely
        saveAuth(resp);
        
        return resp;
      } catch (error) {
        // Enhance error messages for better user experience
        if (error instanceof Error) {
          // Don't expose technical details to user
          const userFriendlyMessages: Record<string, string> = {
            'Failed to fetch': 'Network error - please check your connection',
            'NetworkError': 'Network error - please check your connection',
            'TypeError': 'Service temporarily unavailable',
            'AbortError': 'Request timeout - please try again'
          };
          
          const userMessage = userFriendlyMessages[error.name] || 
                             userFriendlyMessages[error.message] || 
                             error.message;
          
          throw new Error(userMessage);
        }
        
        throw new Error('Login failed - please try again');
      }
    },
    // Additional options for better UX
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error.message.includes('Invalid') || 
          error.message.includes('PIN') || 
          error.message.includes('phone')) {
        return false;
      }
      // Retry network errors up to 2 times
      return failureCount < 2;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
  });
}
