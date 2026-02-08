// lib/services/leads/qualification.ts

export interface LeadData {
  name: string;
  email: string;
  phone: string;
  serviceType: string;
  location: string;
  message?: string;
}

export interface QualificationRule {
  id: string;
  field:
    | "serviceType"
    | "location"
    | "message"
    | "contactCompleteness"
    | "timeOfDay";
  condition:
    | "equals"
    | "contains"
    | "startsWith"
    | "endsWith"
    | "regex"
    | "in"
    | "notEmpty";
  value: string | string[] | number;
  score: number; // Points to add/subtract
  tag?: string; // Optional tag to apply
}

export interface QualificationSettings {
  rules: QualificationRule[];
  priorityThresholds: {
    high: number; // Default: 80
    medium: number; // Default: 60
  };
}

export interface BusinessSettings {
  serviceArea?: string;
  location?: string;
  preferredServices?: string[];
  blacklistedKeywords?: string[];
  qualification?: QualificationSettings; // Add this for custom rules
}

export interface QualificationResult {
  priority: "low" | "medium" | "high";
  tags: string[];
  score: number;
  notes: string;
  shouldAutoContact?: boolean;
}

// Helper function to evaluate a single rule
function evaluateRule(leadData: LeadData, rule: QualificationRule): boolean {
  let fieldValue: string | number | string[];

  // Get the field value from leadData
  switch (rule.field) {
    case "serviceType":
      fieldValue = leadData.serviceType.toLowerCase();
      break;
    case "location":
      fieldValue = leadData.location.toLowerCase();
      break;
    case "message":
      fieldValue = (leadData.message || "").toLowerCase();
      break;
    case "contactCompleteness":
      const contactScore = [
        leadData.name.length > 2,
        leadData.email.includes("@"),
        leadData.phone.length >= 10,
        leadData.location.length > 2,
      ].filter(Boolean).length;
      fieldValue = contactScore;
      break;
    case "timeOfDay":
      fieldValue = new Date().getHours();
      break;
    default:
      return false;
  }

  // Check the condition
  const ruleValue =
    typeof rule.value === "string" ? rule.value.toLowerCase() : rule.value;

  switch (rule.condition) {
    case "equals":
      return String(fieldValue) === String(ruleValue);
    case "contains":
      return String(fieldValue).includes(String(ruleValue));
    case "startsWith":
      return String(fieldValue).startsWith(String(ruleValue));
    case "endsWith":
      return String(fieldValue).endsWith(String(ruleValue));
    case "regex":
      try {
        const regex = new RegExp(String(ruleValue), "i");
        return regex.test(String(fieldValue));
      } catch {
        return false;
      }
    case "in":
      if (Array.isArray(ruleValue)) {
        return ruleValue.includes(String(fieldValue));
      }
      return String(ruleValue)
        .split(",")
        .map((v) => v.trim())
        .includes(String(fieldValue));
    case "notEmpty":
      return String(fieldValue).trim().length > 0;
    default:
      return false;
  }
}

export function autoQualifyLead(
  leadData: LeadData,
  businessSettings: BusinessSettings = {},
): QualificationResult {
  let score = 50; // Start with medium priority
  const tags: string[] = [];
  const notes: string[] = [];

  // Check if business has custom qualification rules
  const customRules = businessSettings.qualification?.rules;
  const customThresholds = businessSettings.qualification?.priorityThresholds;

  // If custom rules exist, use them
  if (customRules && customRules.length > 0) {
    console.log("Using custom qualification rules:", customRules.length);

    customRules.forEach((rule) => {
      const matches = evaluateRule(leadData, rule);
      if (matches) {
        score += rule.score;
        if (rule.tag && !tags.includes(rule.tag)) {
          tags.push(rule.tag);
        }
        notes.push(
          `Rule matched: ${rule.field} ${rule.condition} ${rule.value}`,
        );
      }
    });

    // Use custom thresholds if available
    const highThreshold = customThresholds?.high || 80;
    const mediumThreshold = customThresholds?.medium || 60;

    // Determine priority based on custom thresholds
    let priority: "low" | "medium" | "high";
    if (score >= highThreshold) {
      priority = "high";
      if (!tags.includes("high-priority")) {
        tags.push("high-priority");
      }
    } else if (score >= mediumThreshold) {
      priority = "medium";
      if (!tags.includes("medium-priority")) {
        tags.push("medium-priority");
      }
    } else {
      priority = "low";
      if (!tags.includes("low-priority")) {
        tags.push("low-priority");
      }
    }

    // Should auto-contact?
    const shouldAutoContact = priority === "high" || tags.includes("emergency");

    return {
      priority,
      tags,
      score,
      notes: notes.join(" | "),
      shouldAutoContact,
    };
  }

  // If no custom rules, use default logic
  console.log("Using default qualification rules");

  // 1. Service Type Analysis
  if (businessSettings.preferredServices?.includes(leadData.serviceType)) {
    score += 20;
    tags.push("preferred-service");
    notes.push("Service matches business preferences");
  }

  if (leadData.serviceType.toLowerCase().includes("emergency")) {
    score += 30;
    tags.push("emergency");
    notes.push("Emergency service requested");
  }

  // 2. Message Analysis
  if (leadData.message) {
    const message = leadData.message.toLowerCase();

    // Positive indicators
    const positiveKeywords = [
      "urgent",
      "asap",
      "immediate",
      "today",
      "tomorrow",
      "now",
    ];
    if (positiveKeywords.some((keyword) => message.includes(keyword))) {
      score += 15;
      tags.push("urgent");
      notes.push("Message indicates urgency");
    }

    // Detailed message
    if (message.length > 100) {
      score += 10;
      tags.push("detailed");
      notes.push("Detailed message provided");
    }

    // Negative indicators
    const negativeKeywords = ["free", "cheap", "lowest", "budget", "price"];
    if (negativeKeywords.some((keyword) => message.includes(keyword))) {
      score -= 10;
      tags.push("price-sensitive");
      notes.push("Price-sensitive inquiry");
    }
  }

  // 3. Contact Completeness
  const contactScore = [
    leadData.name.length > 2,
    leadData.email.includes("@"),
    leadData.phone.length >= 10,
    leadData.location.length > 2,
  ].filter(Boolean).length;

  if (contactScore === 4) {
    score += 15;
    tags.push("complete-contact");
    notes.push("Complete contact information provided");
  }

  // 4. Location Analysis (if business has service area)
  if (businessSettings.serviceArea && businessSettings.location) {
    const businessCity = businessSettings.location.toLowerCase();
    const leadCity = leadData.location.toLowerCase();

    if (leadCity.includes(businessCity) || businessCity.includes(leadCity)) {
      score += 20;
      tags.push("local");
      notes.push("Lead is in service area");
    } else {
      score -= 15;
      tags.push("out-of-area");
      notes.push("Lead is outside service area");
    }
  }

  // 5. Time-based qualification (if we had time of day)
  const hour = new Date().getHours();
  if (hour >= 9 && hour <= 17) {
    // Business hours
    tags.push("business-hours");
  } else {
    // After hours - might indicate urgency
    score += 5;
    tags.push("after-hours");
    notes.push("Submitted outside business hours");
  }

  // Determine priority based on score
  let priority: "low" | "medium" | "high";
  if (score >= 80) {
    priority = "high";
    tags.push("high-priority");
  } else if (score >= 60) {
    priority = "medium";
    tags.push("medium-priority");
  } else {
    priority = "low";
    tags.push("low-priority");
  }

  // Should auto-contact?
  const shouldAutoContact = priority === "high" || tags.includes("emergency");

  return {
    priority,
    tags,
    score,
    notes: notes.join(" | "),
    shouldAutoContact,
  };
}

// Example usage in form submission
export async function processLeadSubmission(
  leadData: LeadData,
  businessId: string,
  businessSettings: BusinessSettings,
) {
  const qualification = autoQualifyLead(leadData, businessSettings);

  // Save lead to database with qualification results
  // This would be called from your form submission API

  return qualification;
}
