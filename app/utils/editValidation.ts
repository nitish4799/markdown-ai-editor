// src/utils/editValidation.ts
import { EditProposal, EditValidationResult, EditError } from '@/types';

export function validateEdit(
  markdown: string,
  proposal: EditProposal
): EditValidationResult {
  const { originalText, proposedText } = proposal;

  // Check if original text exists
  if (!markdown.includes(originalText)) {
    return {
      valid: false,
      error: {
        type: 'not_found',
        message: 'The text to edit was not found in the document. The content may have changed.',
      },
    };
  }

  // Check for multiple occurrences (ambiguous edit)
  const occurrences = markdown.split(originalText).length - 1;
  if (occurrences > 1) {
    return {
      valid: false,
      error: {
        type: 'ambiguous',
        message: `Found ${occurrences} matches for the text to edit. Please select a more specific section.`,
      },
    };
  }

  // Check for potentially unsafe edits
  if (containsUnsafeContent(proposedText)) {
    return {
      valid: false,
      error: {
        type: 'unsafe',
        message: 'The proposed edit contains potentially unsafe content (scripts, iframes, etc.).',
      },
    };
  }

  // Validate Markdown structure
  const newMarkdown = markdown.replace(originalText, proposedText);
  if (!isValidMarkdown(newMarkdown)) {
    return {
      valid: false,
      error: {
        type: 'malformed',
        message: 'The proposed edit would create malformed Markdown syntax.',
      },
    };
  }

  return { valid: true, newMarkdown };
}

function containsUnsafeContent(text: string): boolean {
  const unsafePatterns = [
    /<script[\s\S]*?>[\s\S]*?<\/script>/gi,
    /<iframe[\s\S]*?>/gi,
    /javascript:/gi,
    /on\w+\s*=/gi, // onclick, onerror, etc.
    /<embed[\s\S]*?>/gi,
    /<object[\s\S]*?>/gi,
  ];

  return unsafePatterns.some((pattern) => pattern.test(text));
}

function isValidMarkdown(markdown: string): boolean {
  // Check for unclosed brackets/parentheses in links
  const linkPattern = /\[|\]|\(|\)/g;
  const links = markdown.match(linkPattern) || [];
  
  let bracketCount = 0;
  let parenCount = 0;
  
  for (const char of links) {
    if (char === '[') bracketCount++;
    if (char === ']') bracketCount--;
    if (char === '(') parenCount++;
    if (char === ')') parenCount--;
    
    // Negative means more closing than opening
    if (bracketCount < 0 || parenCount < 0) return false;
  }
  
  // Should end with balanced brackets
  if (bracketCount !== 0 || parenCount !== 0) {
    return false;
  }

  // Check for malformed headers (more than 6 #)
  if (/^#{7,}/m.test(markdown)) {
    return false;
  }

  // Check for malformed code blocks - FIX HERE
  const codeBlockMatches = markdown.match(/```/g);
  const codeBlockMarkers = codeBlockMatches ? codeBlockMatches.length : 0;
  if (codeBlockMarkers % 2 !== 0) {
    return false;
  }


  return true;
}

