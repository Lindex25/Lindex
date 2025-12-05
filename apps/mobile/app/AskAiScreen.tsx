/**
 * LINDEX Mobile - Ask AI Screen
 *
 * ═══════════════════════════════════════════════════════════════════════════
 * COMPLIANCE NOTICE - DO NOT REMOVE
 * ═══════════════════════════════════════════════════════════════════════════
 *
 * This screen provides a mobile interface for querying evidence using AI.
 *
 * ⚠️ MANDATORY UX ELEMENTS - REQUIRE LEGAL REVIEW TO REMOVE ⚠️
 *
 * The banner and limitation notice displayed in this screen are MANDATORY
 * compliance elements for legal liability protection. They are not optional
 * design elements that can be hidden, minimized, or removed to improve user
 * experience or aesthetics. Removing or modifying these elements without
 * explicit legal review could:
 *
 * • Expose LINDEX to unauthorized practice of law violations
 * • Create misleading expectations that AI provides professional legal advice
 * • Increase liability if users make decisions based solely on AI output
 * • Violate terms of service and informed consent requirements
 *
 * MANDATORY COMPLIANCE ELEMENTS (DO NOT REMOVE):
 *
 * 1. ✅ Info Banner (Top of Screen):
 *    "LINDEX uses AI to help you explore your evidence. It cannot tell you
 *    what a judge, tribunal, or lawyer will decide, and it does not replace
 *    legal advice."
 *
 *    PURPOSE: Sets expectations before user interaction. Critical first notice
 *    that system has limitations and is not legal counsel.
 *
 * 2. ✅ "NOT LEGAL ADVICE" Badge (With Every Answer):
 *    Prominent badge displayed above every AI-generated answer.
 *
 *    PURPOSE: Constant visual reminder that output is informational, not
 *    professional guidance. Prevents over-reliance on AI responses.
 *
 * 3. ✅ Limitation Notice (Below Every Answer):
 *    "⚠️ Important: This answer is based only on the evidence you uploaded.
 *    It may be incomplete or inaccurate and is not legal advice."
 *
 *    PURPOSE: Discloses answer is evidence-only, may contain errors, and
 *    reiterates not legal advice. Essential for informed user decisions.
 *
 * 4. ✅ Sources Section (Answer Transparency):
 *    Lists which evidence documents were used, with IDs and text excerpts.
 *
 *    PURPOSE: Allows users to trace AI claims back to source documents.
 *    Critical for transparency and user verification of accuracy.
 *
 * CRITICAL LEGAL REQUIREMENTS:
 * • This screen must NOT be presented as providing legal advice or legal strategy
 * • Users must understand AI answers are based ONLY on their uploaded evidence
 * • Users must see the limitation notice with EVERY answer (no hiding it)
 * • The compliance banner text is legally required and must remain visible
 * • System must not claim to predict outcomes, judge decisions, or case results
 *
 * LEGAL & ETHICAL SAFEGUARDS:
 * • AI cannot predict what judges, tribunals, or lawyers will decide
 * • AI does not access external legal databases, case law repositories, or statute APIs
 * • AI answers come EXCLUSIVELY from user's uploaded evidence
 * • AI cannot cite case law or legislation unless present in user's documents
 * • Users must be directed to consult qualified legal professionals for actual advice
 *
 * BEFORE MODIFYING THESE ELEMENTS:
 * 1. Obtain approval from legal counsel experienced in legal tech compliance
 * 2. Review state bar rules on unauthorized practice of law
 * 3. Update app store descriptions, terms of service, and privacy policy
 * 4. Document changes in compliance/audit logs
 * 5. Consider user safety implications and organizational liability exposure
 *
 * These compliance elements protect users from harm and LINDEX from legal liability.
 * Removing them could expose users to harm and create significant legal risks.
 *
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';

// ============================================================================
// Types
// ============================================================================

interface AskAiScreenProps {
  /** Case UUID to query against */
  caseId: string;
  /** API base URL (e.g., http://localhost:3000 or LAN IP for development) */
  apiBaseUrl: string;
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
 * Ask AI Screen - Query case evidence using RAG on mobile
 *
 * This screen allows users to ask questions about their uploaded evidence
 * via a mobile-optimized interface. All answers are generated exclusively
 * from the user's case evidence, not external legal databases.
 *
 * @param props - Component props
 * @param props.caseId - UUID of the case to query
 * @param props.apiBaseUrl - Base URL of the API server
 */
export default function AskAiScreen({ caseId, apiBaseUrl }: AskAiScreenProps) {
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
    const trimmedQuestion = question.trim();
    if (!trimmedQuestion) {
      Alert.alert('Validation Error', 'Please enter a question');
      return;
    }

    setIsLoading(true);

    try {
      const url = `${apiBaseUrl}/api/cases/${caseId}/query`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: trimmedQuestion }),
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

  // ──────────────────────────────────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────────────────────────────────

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* ────────────────────────────────────────────────────────────────────
          COMPLIANCE: Info Banner (DO NOT REMOVE)
          Explains AI limitations and that this is not legal advice
      ──────────────────────────────────────────────────────────────────── */}
      <View style={styles.infoBanner}>
        <Text style={styles.infoBannerIcon}>ℹ️</Text>
        <Text style={styles.infoBannerText}>
          <Text style={styles.infoBannerTextBold}>
            LINDEX uses AI to help you explore your evidence.
          </Text>{' '}
          It cannot tell you what a judge, tribunal, or lawyer will decide, and
          it does not replace legal advice.
        </Text>
      </View>

      {/* ────────────────────────────────────────────────────────────────────
          Question Input
      ──────────────────────────────────────────────────────────────────── */}
      <View style={styles.inputSection}>
        <Text style={styles.label}>Ask a question about your evidence:</Text>
        <TextInput
          style={styles.textInput}
          value={question}
          onChangeText={setQuestion}
          placeholder="Example: What documents mention the incident on March 15th?"
          placeholderTextColor="#999"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!isLoading}
        />
      </View>

      {/* ────────────────────────────────────────────────────────────────────
          Submit Button
      ──────────────────────────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[
          styles.button,
          (isLoading || !question.trim()) && styles.buttonDisabled,
        ]}
        onPress={handleAskAi}
        disabled={isLoading || !question.trim()}
        activeOpacity={0.7}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Thinking...' : 'Ask AI'}
        </Text>
      </TouchableOpacity>

      {/* ────────────────────────────────────────────────────────────────────
          Loading State
      ──────────────────────────────────────────────────────────────────── */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2196f3" />
          <Text style={styles.loadingText}>
            Searching your evidence and generating an answer...
          </Text>
        </View>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          Error Display
      ──────────────────────────────────────────────────────────────────── */}
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* ────────────────────────────────────────────────────────────────────
          Answer Display
      ──────────────────────────────────────────────────────────────────── */}
      {answer && (
        <View style={styles.answerContainer}>
          {/* COMPLIANCE: "Not Legal Advice" Badge (DO NOT REMOVE) */}
          <View style={styles.complianceBadge}>
            <Text style={styles.badgeIcon}>⚖️</Text>
            <Text style={styles.badgeText}>NOT LEGAL ADVICE</Text>
          </View>

          {/* Main Answer Text */}
          <View style={styles.answerSection}>
            <Text style={styles.answerHeading}>Answer</Text>
            <View style={styles.answerTextContainer}>
              <Text style={styles.answerText}>{answer.answer_text}</Text>
            </View>
          </View>

          {/* COMPLIANCE: Limitation Notice (DO NOT REMOVE) */}
          <View style={styles.limitationNotice}>
            <Text style={styles.limitationNoticeText}>
              <Text style={styles.limitationNoticeBold}>⚠️ Important:</Text>{' '}
              {answer.limitation_notice}
            </Text>
          </View>

          {/* Sources Section - Transparency Requirement */}
          {answer.sources.length > 0 && (
            <View style={styles.sourcesSection}>
              <Text style={styles.sourcesHeading}>
                Sources ({answer.sources.length})
              </Text>
              <Text style={styles.sourcesDescription}>
                The answer above was generated from these evidence snippets:
              </Text>
              {answer.sources.map((source, index) => (
                <View key={source.evidence_id} style={styles.sourceItem}>
                  <View style={styles.sourceHeader}>
                    <View style={styles.sourceNumberBadge}>
                      <Text style={styles.sourceNumber}>#{index + 1}</Text>
                    </View>
                    <Text style={styles.sourceId}>
                      Evidence ID: {source.evidence_id.substring(0, 8)}...
                    </Text>
                  </View>
                  <Text style={styles.sourceSnippet}>
                    {/* Truncate snippet to ~200 chars for mobile display */}
                    {source.snippet.length > 200
                      ? source.snippet.substring(0, 200).trim() + '...'
                      : source.snippet}
                  </Text>
                </View>
              ))}
            </View>
          )}

          {/* No Sources Warning */}
          {answer.sources.length === 0 && (
            <View style={styles.noSourcesWarning}>
              <Text style={styles.noSourcesText}>
                ⚠️ No evidence sources were found for this question. The AI may
                not have enough information to provide a reliable answer.
              </Text>
            </View>
          )}
        </View>
      )}
    </ScrollView>
  );
}

// ============================================================================
// Styles
// ============================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40, // Extra padding for keyboard
  },

  // Info Banner (Compliance)
  infoBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 16,
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#2196f3',
    borderRadius: 8,
    marginBottom: 20,
  },
  infoBannerIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  infoBannerText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
    color: '#0d47a1',
  },
  infoBannerTextBold: {
    fontWeight: '700',
  },

  // Input Section
  inputSection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    lineHeight: 20,
    minHeight: 100,
    backgroundColor: '#fff',
    ...Platform.select({
      ios: {
        paddingTop: 12,
      },
      android: {
        textAlignVertical: 'top',
      },
    }),
  },

  // Button
  button: {
    backgroundColor: '#2196f3',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },

  // Loading State
  loadingContainer: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 20,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },

  // Error Display
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#f44336',
    borderRadius: 8,
    marginBottom: 20,
  },
  errorIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: '#c62828',
  },

  // Answer Container
  answerContainer: {
    padding: 16,
    backgroundColor: '#fafafa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    marginBottom: 20,
  },

  // Compliance Badge (DO NOT REMOVE)
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
    borderRadius: 4,
    marginBottom: 16,
  },
  badgeIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e65100',
    letterSpacing: 0.5,
  },

  // Answer Section
  answerSection: {
    marginBottom: 16,
  },
  answerHeading: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333',
  },
  answerTextContainer: {
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
  },
  answerText: {
    fontSize: 14,
    lineHeight: 22,
    color: '#333',
  },

  // Limitation Notice (Compliance - DO NOT REMOVE)
  limitationNotice: {
    padding: 12,
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
    borderRadius: 6,
    marginBottom: 16,
  },
  limitationNoticeText: {
    fontSize: 13,
    lineHeight: 19,
    color: '#d84315',
  },
  limitationNoticeBold: {
    fontWeight: '700',
  },

  // Sources Section
  sourcesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
  },
  sourcesHeading: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  sourcesDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  sourceItem: {
    padding: 12,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    marginBottom: 10,
  },
  sourceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  sourceNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#2196f3',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  sourceNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#fff',
  },
  sourceId: {
    fontSize: 12,
    color: '#666',
    fontFamily: Platform.select({ ios: 'Courier', android: 'monospace' }),
  },
  sourceSnippet: {
    fontSize: 13,
    lineHeight: 19,
    color: '#555',
    paddingLeft: 32,
  },

  // No Sources Warning
  noSourcesWarning: {
    padding: 12,
    backgroundColor: '#fff3e0',
    borderWidth: 1,
    borderColor: '#ff9800',
    borderRadius: 6,
    marginTop: 12,
  },
  noSourcesText: {
    fontSize: 13,
    color: '#e65100',
    lineHeight: 19,
  },
});

// ============================================================================
// Usage Example
// ============================================================================

/*

EXAMPLE USAGE IN EXPO ROUTER:

Option 1: As a standalone screen in app/ask-ai.tsx
─────────────────────────────────────────────────

```typescript
// app/ask-ai.tsx
import { useLocalSearchParams } from 'expo-router';
import AskAiScreen from './AskAiScreen';

export default function AskAiRoute() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();

  // Get API base URL from environment or config
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  return <AskAiScreen caseId={caseId || ''} apiBaseUrl={API_BASE_URL} />;
}
```

Navigate to it with:
```typescript
import { router } from 'expo-router';

router.push(`/ask-ai?caseId=${selectedCaseId}`);
```


Option 2: Embedded in a case detail screen
───────────────────────────────────────────

```typescript
// app/cases/[caseId].tsx
import { useLocalSearchParams } from 'expo-router';
import { View, Text, ScrollView } from 'react-native';
import AskAiScreen from '../AskAiScreen';

export default function CaseDetailScreen() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  return (
    <ScrollView>
      <View style={{ padding: 16 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
          Case Details
        </Text>

        {/* Case metadata, evidence list, etc. */}

        <View style={{ marginTop: 32 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>
            Ask AI About Your Evidence
          </Text>
          <AskAiScreen caseId={caseId || ''} apiBaseUrl={API_BASE_URL} />
        </View>
      </View>
    </ScrollView>
  );
}
```


Option 3: As a modal
────────────────────

```typescript
// app/_layout.tsx - add modal route
<Stack.Screen
  name="ask-ai-modal"
  options={{
    presentation: 'modal',
    title: 'Ask AI'
  }}
/>

// app/ask-ai-modal.tsx
import { useLocalSearchParams } from 'expo-router';
import AskAiScreen from './AskAiScreen';

export default function AskAiModal() {
  const { caseId } = useLocalSearchParams<{ caseId: string }>();
  const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

  return <AskAiScreen caseId={caseId || ''} apiBaseUrl={API_BASE_URL} />;
}
```

Open modal with:
```typescript
import { router } from 'expo-router';

router.push(`/ask-ai-modal?caseId=${selectedCaseId}`);
```


CONFIGURATION NOTES:
────────────────────

1. **API Base URL**: Set in .env or app.config.ts:
   ```typescript
   // app.config.ts
   export default {
     expo: {
       extra: {
         apiUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
       },
     },
   };
   ```

2. **Development**: Use your local machine's LAN IP for testing on physical devices:
   - macOS: `ipconfig getifaddr en0`
   - Windows: `ipconfig` (look for IPv4 Address)
   - Linux: `ip addr show`
   - Example: `http://192.168.1.100:3000`

3. **Authentication**: Ensure Clerk session cookies work with your API.
   You may need to configure cookie/token handling for mobile.

4. **Network Security**:
   - iOS: Add API domain to Info.plist NSAppTransportSecurity
   - Android: Check android/app/src/main/AndroidManifest.xml network config

*/

