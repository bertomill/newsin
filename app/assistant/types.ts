/**
 * Types for the Assistant feature
 * These types are shared between the assistant page and API
 */

import { Message as PerplexityMessage } from '@/lib/perplexity';

// Message type for chat interactions
export interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  citations?: string[];
}

// User context from personalization
export interface UserBusinessContext {
  business?: {
    sector?: string;
    otherSector?: string;
    description?: string;
  };
  role?: {
    type?: string;
    otherType?: string;
  };
  themes?: {
    selected?: string[];
    custom?: string;
  };
}

// Request to the assistant API
export interface AssistantApiRequest {
  messages: PerplexityMessage[];
  userContext?: UserBusinessContext;
}

// Response from the assistant API
export interface AssistantApiResponse {
  content: string;
  citations?: string[];
  error?: string;
} 