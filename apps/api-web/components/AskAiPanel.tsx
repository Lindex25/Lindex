/**
 * LINDEX - Ask AI Panel Component
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE NOTICE - DO NOT REMOVE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This component provides a user interface for querying evidence using AI.
 *
 * ⚠️ MANDATORY UX ELEMENTS - REQUIRE LEGAL REVIEW TO REMOVE ⚠️
 *
 * The following UI elements are MANDATORY for compliance and legal liability
 * protection. They are not optional styling choices or features that can be
 * A/B tested or hidden for "cleaner design". Removing or hiding these elements
 * without explicit legal review and approval could:
 *
 * • Expose LINDEX to unauthorized practice of law claims
 * • Create liability for users who mistake AI output for legal advice
 * • Violate professional responsibility rules in jurisdictions where users operate
 * • Breach terms of service and user consent agreements
 *
 * REQUIRED COMPLIANCE ELEMENTS (DO NOT REMOVE):
 *
 * 1. ✅ Info Banner (Top of Panel):
 *    "LINDEX uses AI to help you explore your evidence. It cannot tell you
 *    what a judge, tribunal, or lawyer will decide, and it does not replace
 *    legal advice."
 *
 *    WHY: Sets user expectations before they ask any questions. Prevents
 *    misunderstanding about the system's capabilities and limitations.
 *
 * 2. ✅ "Not Legal Advice" Badge (With Every Answer):
 *    Prominently displayed badge that reads "Not Legal Advice" or similar.
 *
 *    WHY: Immediate visual reminder that AI output is informational only,
 *    not professional legal guidance. Reduces risk of reliance on AI alone.
 *
 * 3. ✅ Limitation Notice (Below Every Answer):
 *    "This answer is based only on the evidence you uploaded. It may be
 *    incomplete or inaccurate and is not legal advice."
 *
 *    WHY: Discloses answer limitations (evidence-only, potential errors) and
 *    reiterates it's not legal advice. Critical for informed consent.
 *
 * 4. ✅ Sources Section (Transparency):
 *    Lists which evidence documents were used to generate the answer, with
 *    evidence IDs and text snippets.
 *
 *    WHY: Enables users to verify AI claims against source documents.
 *    Promotes transparency and allows users to assess answer reliability.
 *
 * LEGAL & ETHICAL REQUIREMENTS:
 * • Users must understand AI answers are NOT legal advice from a qualified attorney
 * • Users must see that answers come from their evidence ONLY (not external legal databases)
 * • Users must be directed to consult legal professionals for actual legal advice
 * • All answers must include source attribution for transparency and verifiability
 * • System must never present itself as capable of predicting outcomes or providing strategy
 *
 * BEFORE MODIFYING THESE ELEMENTS:
 * 1. Consult with legal counsel familiar with legal tech regulations
 * 2. Review unauthorized practice of law statutes in target jurisdictions
 * 3. Update Terms of Service and user consent flows accordingly
 * 4. Document changes in compliance audit trail
 * 5. Consider impact on user safety and liability exposure
 *
 * These compliance elements protect both users and LINDEX from legal harm.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

'use client';

import { useState } from 'react';

// ============================================================================
// Types
// ============================================================================

interface AskAiPanelProps {
  /** Case UUID to query against */
  caseId: string;
}

interface AiSource {
  evidence_id: string;
  snippet: string;
}

interface AiResponse {
  answer_text: string;
  sources: AiSource[];
  limitation_notice: string;
}

interface ErrorResponse {
  error: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Ask AI Panel - Query case evidence using RAG
 *
 * This component allows users to ask questions about their uploaded evidence.
 * All answers are generated exclusively from the user's case evidence, not
 * external legal databases.
 *
 * @param props - Component props
 * @param props.caseId - UUID of the case to query
 */
export default function AskAiPanel({ caseId }: AskAiPanelProps) {
  // ──────────────────────────────────────────────────────────────────────────
  // State Management
  // ──────────────────────────────────────────────────────────────────────────

  const [question, setQuestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<AiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ──────────────────────────────────────────────────────────────────────────
  // Event Handlers
  // ──────────────────────────────────────────────────────────────────────────

  const handleAskAi = async () => {
    // Reset state
    setError(null);
    setAnswer(null);

    // Validate question
    if (!question.trim()) {
      setError('Please enter a question');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/cases/${caseId}/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: question.trim() }),
      });

      if (!response.ok) {
        // Handle error responses
        const errorData: ErrorResponse = await response.json();
        setError(
          errorData.error ||
            'Unable to get an answer at the moment. Please try again.'
        );
        return;
      }

      const data: AiResponse = await response.json();
      setAnswer(data);
    } catch (err) {
      console.error('Error querying AI:', err);
      setError('Unable to get an answer at the moment. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow Cmd/Ctrl + Enter to submit
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleAskAi();
    }
  };

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <div className="ask-ai-panel" style={styles.container}>
      {/* ────────────────────────────────────────────────────────────────────
          COMPLIANCE: Info Banner (DO NOT REMOVE)
          Explains AI limitations and that this is not legal advice
      ──────────────────────────────────────────────────────────────────── */}
      <div style={styles.infoBanner}>
        <div style={styles.infoBannerIcon}>ℹ️</div>
        <div style={styles.infoBannerText}>
          <strong>LINDEX uses AI to help you explore your evidence.</strong> It
          cannot tell you what a judge, tribunal, or lawyer will decide, and it
          does not replace legal advice.
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          Question Input
      ──────────────────────────────────────────────────────────────────── */}
      <div style={styles.inputSection}>
        <label htmlFor="ai-question" style={styles.label}>
          Ask a question about your evidence:
        </label>
        <textarea
          id="ai-question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyPress}
          placeholder="Example: What documents mention the incident on March 15th?"
          rows={4}
          style={styles.textarea}
          disabled={isLoading}
        />
        <div style={styles.inputHint}>
          Press Cmd/Ctrl + Enter to submit quickly
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────────────
          Submit Button
      ──────────────────────────────────────────────────────────────────── */}
      <button
        onClick={handleAskAi}
        disabled={isLoading || !question.trim()}
        style={{
          ...styles.button,
          ...(isLoading || !question.trim() ? styles.buttonDisabled : {}),
        }}
      >
        {isLoading ? 'Thinking...' : 'Ask AI'}
      </button>

      {/* ────────────────────────────────────────────────────────────────────
          Loading State
      ──────────────────────────────────────────────────────────────────── */}
      {isLoading && (
        <div style={styles.loadingContainer}>
          <div style={styles.spinner}>⏳</div>
          <p style={styles.loadingText}>
            Searching your evidence and generating an answer...
          </p>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          Error Display
      ──────────────────────────────────────────────────────────────────── */}
      {error && (
        <div style={styles.errorContainer}>
          <div style={styles.errorIcon}>⚠️</div>
          <p style={styles.errorText}>{error}</p>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          Answer Display
      ──────────────────────────────────────────────────────────────────── */}
      {answer && (
        <div style={styles.answerContainer}>
          {/* COMPLIANCE: "Not Legal Advice" Badge (DO NOT REMOVE) */}
          <div style={styles.complianceBadge}>
            <span style={styles.badgeIcon}>⚖️</span>
            <span style={styles.badgeText}>Not Legal Advice</span>
          </div>

          {/* Main Answer Text */}
          <div style={styles.answerSection}>
            <h3 style={styles.answerHeading}>Answer</h3>
            <div style={styles.answerText}>{answer.answer_text}</div>
          </div>

          {/* COMPLIANCE: Limitation Notice (DO NOT REMOVE) */}
          <div style={styles.limitationNotice}>
            <strong>⚠️ Important:</strong> {answer.limitation_notice}
          </div>

          {/* Sources Section - Transparency Requirement */}
          {answer.sources.length > 0 && (
            <div style={styles.sourcesSection}>
              <h4 style={styles.sourcesHeading}>
                Sources ({answer.sources.length})
              </h4>
              <p style={styles.sourcesDescription}>
                The answer above was generated from these evidence snippets:
              </p>
              <div style={styles.sourcesList}>
                {answer.sources.map((source, index) => (
                  <div key={source.evidence_id} style={styles.sourceItem}>
                    <div style={styles.sourceHeader}>
                      <span style={styles.sourceNumber}>#{index + 1}</span>
                      <span style={styles.sourceId}>
                        Evidence ID: {source.evidence_id.substring(0, 8)}...
                      </span>
                    </div>
                    <div style={styles.sourceSnippet}>
                      {/* Truncate snippet to ~250 chars for display */}
                      {source.snippet.length > 250
                        ? source.snippet.substring(0, 250).trim() + '...'
                        : source.snippet}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* No Sources Warning */}
          {answer.sources.length === 0 && (
            <div style={styles.noSourcesWarning}>
              <p>
                ⚠️ No evidence sources were found for this question. The AI may
                not have enough information to provide a reliable answer.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Inline Styles (Convert to CSS modules or Tailwind in production)
// ============================================================================

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    maxWidth: '800px',
    margin: '0 auto',
    padding: '24px',
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },

  // Info Banner (Compliance)
  infoBanner: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    backgroundColor: '#e3f2fd',
    border: '1px solid #2196f3',
    borderRadius: '8px',
    marginBottom: '24px',
  },
  infoBannerIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  infoBannerText: {
    fontSize: '14px',
    lineHeight: '1.6',
    color: '#0d47a1',
  },

  // Input Section
  inputSection: {
    marginBottom: '16px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#333',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    lineHeight: '1.6',
    border: '1px solid #ccc',
    borderRadius: '6px',
    resize: 'vertical',
    fontFamily: 'inherit',
    boxSizing: 'border-box',
  },
  inputHint: {
    fontSize: '12px',
    color: '#666',
    marginTop: '6px',
  },

  // Button
  button: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 600,
    color: '#fff',
    backgroundColor: '#2196f3',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
    cursor: 'not-allowed',
  },

  // Loading State
  loadingContainer: {
    marginTop: '24px',
    padding: '24px',
    textAlign: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
  },
  spinner: {
    fontSize: '32px',
    marginBottom: '12px',
  },
  loadingText: {
    fontSize: '14px',
    color: '#666',
    margin: 0,
  },

  // Error Display
  errorContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '24px',
    padding: '16px',
    backgroundColor: '#ffebee',
    border: '1px solid #f44336',
    borderRadius: '8px',
  },
  errorIcon: {
    fontSize: '20px',
    flexShrink: 0,
  },
  errorText: {
    fontSize: '14px',
    color: '#c62828',
    margin: 0,
  },

  // Answer Container
  answerContainer: {
    marginTop: '24px',
    padding: '24px',
    backgroundColor: '#fafafa',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
  },

  // Compliance Badge (DO NOT REMOVE)
  complianceBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 12px',
    backgroundColor: '#fff3e0',
    border: '1px solid #ff9800',
    borderRadius: '4px',
    marginBottom: '16px',
  },
  badgeIcon: {
    fontSize: '16px',
  },
  badgeText: {
    fontSize: '12px',
    fontWeight: 700,
    color: '#e65100',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },

  // Answer Section
  answerSection: {
    marginBottom: '20px',
  },
  answerHeading: {
    fontSize: '16px',
    fontWeight: 600,
    marginBottom: '12px',
    color: '#333',
  },
  answerText: {
    fontSize: '14px',
    lineHeight: '1.8',
    color: '#333',
    whiteSpace: 'pre-wrap',
    padding: '16px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
  },

  // Limitation Notice (Compliance - DO NOT REMOVE)
  limitationNotice: {
    padding: '12px',
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#d84315',
    backgroundColor: '#fff3e0',
    border: '1px solid #ff9800',
    borderRadius: '6px',
    marginBottom: '20px',
  },

  // Sources Section
  sourcesSection: {
    marginTop: '24px',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
  },
  sourcesHeading: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: '8px',
    color: '#333',
  },
  sourcesDescription: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '16px',
  },
  sourcesList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sourceItem: {
    padding: '12px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
  },
  sourceHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    marginBottom: '8px',
  },
  sourceNumber: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    fontSize: '11px',
    fontWeight: 700,
    color: '#fff',
    backgroundColor: '#2196f3',
    borderRadius: '50%',
  },
  sourceId: {
    fontSize: '12px',
    color: '#666',
    fontFamily: 'monospace',
  },
  sourceSnippet: {
    fontSize: '13px',
    lineHeight: '1.6',
    color: '#555',
    paddingLeft: '32px',
  },

  // No Sources Warning
  noSourcesWarning: {
    marginTop: '16px',
    padding: '12px',
    backgroundColor: '#fff3e0',
    border: '1px solid #ff9800',
    borderRadius: '6px',
    fontSize: '13px',
    color: '#e65100',
  },
};

// ============================================================================
// Usage Example
// ============================================================================

/*

EXAMPLE USAGE IN A CASE DETAIL PAGE:

File: app/cases/[caseId]/page.tsx

```typescript
import AskAiPanel from '@/components/AskAiPanel';

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;

  return (
    <div>
      <h1>Case Details</h1>

      {/* Case metadata, evidence list, etc. */}

      <section>
        <h2>Ask AI About Your Evidence</h2>
        <AskAiPanel caseId={caseId} />
      </section>
    </div>
  );
}
```

INTEGRATION NOTES:
- This component handles its own state (question, loading, answer)
- It requires the user to be authenticated (handled by API endpoint)
- Ensure the caseId belongs to the authenticated user (API enforces this)
- Consider adding rate limiting on the frontend (e.g., max 10 queries/min)
- In production, replace inline styles with Tailwind CSS or CSS modules
- Add analytics tracking for query patterns and user engagement

*/

