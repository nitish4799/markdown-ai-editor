// src/types/index.ts
export interface EditRequest {
  id: string;
  prompt: string;
  targetSection?: string;
  timestamp: number;
}

export interface EditProposal {
  id: string;
  originalText: string;
  proposedText: string;
  description: string;
  requestId: string;
}

export interface AppState {
  markdown: string;
  editHistory: EditProposal[];
  currentProposal?: EditProposal;
}

export interface EditError {
  type: 'not_found' | 'ambiguous' | 'unsafe' | 'malformed';
  message: string;
}

export interface EditValidationResult {
  valid: boolean;
  error?: EditError;
  newMarkdown?: string;
}
