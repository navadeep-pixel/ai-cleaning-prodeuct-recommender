/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface CleaningRequirements {
  industryType: string;
  facilitySize: string; // e.g., "1500 sq ft", "Large (10k+ sq ft)"
  numberRooms: string;
  cleaningFrequency: string; // e.g., "Daily", "Weekly"
  hygieneLevel: string; // "Standard", "High Sanitation", "Sterilization"
  budget: string; // "Economy", "Standard", "Premium"
  ecoFriendly: string; // "No preference", "Prefer eco-friendly", "Eco-friendly ONLY"
  specialRequirements: string;
  areaToClean: string; // e.g., "Restrooms, laminate floors, countertops"
}

export interface RecommendedProduct {
  name: string;
  category: string;
  purpose: string;
  usage: string;
  priority: "Essential" | "Recommended" | "Optional";
}

export interface RecommendationResult {
  summary: string;
  recommendedProducts: RecommendedProduct[];
  quantitySuggestion: string;
  safetyNotes: string[];
  additionalRecommendations: string[];
  isAiGenerated: boolean;
}
