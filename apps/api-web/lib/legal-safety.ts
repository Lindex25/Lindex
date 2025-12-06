/**
 * Legal Safety Guards - Heuristic Question Detection
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * PURPOSE & LIMITATIONS
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This module provides a MINIMAL HEURISTIC GUARD to detect and block obvious
 * legal advice questions before they reach the OpenAI API.
 *
 * WHAT THIS IS:
 * • A lightweight, client-side pattern matcher
 * • A first line of defense to short-circuit obvious legal advice requests
 * • A cost optimization (avoids unnecessary API calls for blocked questions)
 * • A user experience improvement (immediate feedback on inappropriate questions)
 *
 * WHAT THIS IS NOT:
 * • An exhaustive or foolproof safety system
 * • A replacement for the AI's system prompt constraints
 * • A substitute for human review of edge cases
 * • A sophisticated NLP classifier or ML model
 *
 * LIMITATIONS:
 * • Simple string matching only (easily bypassed with creative phrasing)
 * • English-language only (no multilingual support)
 * • False negatives: Will miss many legal advice questions not matching patterns
 * • False positives: May occasionally block legitimate evidence questions
 * • Not legally validated or certified (heuristic only)
 *
 * DEFENSE IN DEPTH:
 * This guard is ONE layer in a multi-layer safety system:
 * 1. Frontend UX: Compliance banners and warnings (first layer)
 * 2. This heuristic guard: Quick pattern matching (second layer)
 * 3. AI system prompt: Instructs model to refuse legal advice (third layer)
 * 4. Limitation notice: Disclaims legal advice in every response (fourth layer)
 * 5. Human review: Monitor logs for abuse or edge cases (fifth layer)
 *
 * FUTURE IMPROVEMENTS:
 * • Add more sophisticated NLP-based classification
 * • Support multilingual question detection
 * • Machine learning model trained on legal vs. evidence questions
 * • Integration with abuse detection systems
 * • A/B testing to measure false positive/negative rates
 *
 * DO NOT RELY ON THIS AS THE ONLY SAFETY MECHANISM.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// Constants
// ============================================================================

/**
 * Patterns that suggest a question is seeking legal advice rather than
 * understanding evidence.
 *
 * These are simple substring matches (case-insensitive).
 * Add more patterns as you identify common legal advice requests.
 *
 * MAINTENANCE NOTE: Review these patterns quarterly and adjust based on
 * actual user query logs.
 */
const LEGAL_ADVICE_PATTERNS = [
  // Strategic advice
  'what should i argue',
  'what argument should i',
  'what should i say in court',
  'what should i tell the judge',
  'what should i present',

  // Outcome prediction
  'how do i win my case',
  'how can i win',
  'what are my chances',
  'will i win',
  'am i going to win',
  'what will the judge decide',
  'what will happen in court',

  // Legal interpretation / research
  'what is the law on',
  "what's the law on",
  'whats the law on',
  'what does the law say about',
  'what are the laws about',
  'is this legal',
  'is this lawful',
  'is this illegal',

  // Statutory/regulatory references (without evidence context)
  'under section',
  'under subsection',
  'according to the act',
  'what statute',
  'what regulation',

  // Legal action recommendations
  'can i sue',
  'should i sue',
  'should i appeal',
  'should i file',
  'should i withdraw',
  'should i settle',
  'can i get damages',
  'how much can i claim',

  // Strategy and tactics
  'what defense should i',
  'what claim should i',
  'what motion should i',
  'how do i respond to',
  'what do i say about',

  // Legal status questions
  'do i have a case',
  'is my case strong',
  'do i have grounds',
] as const;

/**
 * Standard limitation notice used across LINDEX.
 * This is the same notice returned by the RAG engine.
 *
 * IMPORTANT: Keep this synchronized with lib/rag.ts and API responses.
 */
export const STANDARD_LIMITATION_NOTICE =
  'This answer is based only on the evidence you uploaded. It may be incomplete or inaccurate and is not legal advice.';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Structure for a legal advice warning response
 */
export interface LegalAdviceWarning {
  /** The warning message explaining why the question cannot be answered */
  answerText: string;

  /** Standard limitation notice (consistent with other responses) */
  limitationNotice: string;
}

// ============================================================================
// Main Functions
// ============================================================================

/**
 * Check if a question appears to be seeking legal advice
 *
 * This function uses simple heuristic pattern matching to detect questions
 * that are likely asking for legal advice, strategy, or outcome prediction
 * rather than questions about the user's own evidence.
 *
 * IMPORTANT LIMITATIONS:
 * - This is NOT exhaustive - many legal advice questions will pass through
 * - This uses simple substring matching - easily bypassed
 * - False positives are possible (legitimate questions may be blocked)
 * - English-language only
 *
 * @param question - The user's question text
 * @returns true if the question appears to be seeking legal advice
 *
 * @example
 * ```typescript
 * isLegalAdviceLikeQuestion("What should I argue in court?")  // true
 * isLegalAdviceLikeQuestion("What documents mention the date?") // false
 * isLegalAdviceLikeQuestion("What is the law on trespassing?") // true
 * isLegalAdviceLikeQuestion("What does my contract say about termination?") // false
 * ```
 */
export function isLegalAdviceLikeQuestion(question: string): boolean {
  // Normalize the question for consistent matching
  const normalized = question.toLowerCase().trim();

  // Empty or very short questions are probably not legal advice requests
  if (normalized.length < 5) {
    return false;
  }

  // Check if the normalized question contains any of the warning patterns
  for (const pattern of LEGAL_ADVICE_PATTERNS) {
    if (normalized.includes(pattern)) {
      return true;
    }
  }

  return false;
}

/**
 * Build a standard legal advice warning response
 *
 * This function returns a fixed warning message that can be shown to users
 * when their question is detected as seeking legal advice.
 *
 * The message:
 * - Clearly states LINDEX cannot provide legal advice
 * - Explains what LINDEX CAN do (help understand evidence)
 * - Directs users to consult qualified legal professionals
 * - Includes the standard limitation notice for consistency
 *
 * @returns Object with answerText and limitationNotice
 *
 * @example
 * ```typescript
 * const warning = buildLegalAdviceWarningAnswer();
 * console.log(warning.answerText);
 * // "I'm not able to tell you what arguments to make..."
 * ```
 */
export function buildLegalAdviceWarningAnswer(): LegalAdviceWarning {
  return {
    answerText:
      "I'm not able to tell you what arguments to make, what the law is, or what outcome you might get. " +
      'LINDEX can only help you explore and understand the evidence you've uploaded. ' +
      'For legal advice about what to do, you should speak to a qualified legal professional.',

    limitationNotice: STANDARD_LIMITATION_NOTICE,
  };
}

/**
 * Get a list of example questions that would be blocked
 *
 * Useful for documentation, testing, and user education.
 * Shows users what kinds of questions they should avoid asking.
 *
 * @returns Array of example questions that would trigger the guard
 */
export function getBlockedQuestionExamples(): string[] {
  return [
    'What should I argue in court?',
    'How do I win my case?',
    'What are my chances of winning?',
    'What is the law on breach of contract?',
    'Should I sue the defendant?',
    'Is this legal?',
    'What will the judge decide?',
    'Under section 123, can I claim damages?',
  ];
}

/**
 * Get a list of example questions that would be allowed
 *
 * Useful for user education - shows what LINDEX CAN help with.
 *
 * @returns Array of example questions that would pass the guard
 */
export function getAllowedQuestionExamples(): string[] {
  return [
    'What documents mention the incident on March 15th?',
    'Does any evidence show when the contract was signed?',
    'Which witnesses describe the accident scene?',
    'What does the email from Smith say about the agreement?',
    'Are there any documents that contradict the claim about timing?',
    'What evidence supports the timeline I provided?',
    'Summarize what the medical reports say about my injury.',
    'Which documents contain financial information?',
  ];
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Validate that a pattern list doesn't have duplicates
 *
 * Useful for catching accidental duplicate patterns during maintenance.
 *
 * @returns true if patterns are unique, false if duplicates exist
 */
export function validatePatterns(): {
  valid: boolean;
  duplicates: string[];
} {
  const seen = new Set<string>();
  const duplicates: string[] = [];

  for (const pattern of LEGAL_ADVICE_PATTERNS) {
    if (seen.has(pattern)) {
      duplicates.push(pattern);
    }
    seen.add(pattern);
  }

  return {
    valid: duplicates.length === 0,
    duplicates,
  };
}

/**
 * Get the total number of patterns being checked
 *
 * Useful for monitoring and documentation.
 *
 * @returns Number of patterns in the detection list
 */
export function getPatternCount(): number {
  return LEGAL_ADVICE_PATTERNS.length;
}


