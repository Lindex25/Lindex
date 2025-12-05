/**
 * LINDEX - Shared TypeScript Types
 *
 * These types define the API contracts between the frontend and backend.
 *
 * IMPORTANT NOTES:
 * - These are internal app-level Data Transfer Objects (DTOs).
 * - They are NOT legal documents or legal advice.
 * - They exist solely to move data safely and consistently between frontend and backend.
 * - All data represented by these types is user-owned and user-scoped.
 * - No external legal databases or advice engines are involved in these data structures.
 *
 * Usage:
 * - Import these types in API routes to ensure consistent response shapes
 * - Import in frontend code for type-safe API consumption
 * - Keep these types in sync with database schema (but use camelCase for JSON)
 */

/**
 * Case - Represents a legal case managed by a user
 *
 * A case is a container for organizing evidence and research related to
 * a specific legal matter. Cases are strictly per-user and isolated.
 */
export interface LindexCase {
  /** Unique identifier (UUID) */
  id: string;
  /** Owner's user ID (UUID) */
  userId: string;
  /** Case title */
  title: string;
  /** Optional case description */
  description?: string | null;
  /** Current status (e.g., "ACTIVE", "CLOSED") */
  status: string;
  /** ISO 8601 timestamp of creation */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Evidence - Represents an uploaded file (document or image)
 *
 * Evidence files are user-uploaded documents or images that belong to a case.
 * They are processed for text extraction and later used for AI-assisted analysis.
 */
export interface LindexEvidence {
  /** Unique identifier (UUID) */
  id: string;
  /** Parent case ID (UUID) */
  caseId: string;
  /** Owner's user ID (UUID) */
  userId: string;
  /** Type of media: "DOCUMENT" or "IMAGE" */
  mediaType: string;
  /** Original filename as uploaded by user */
  originalFilename: string;
  /** MIME type (e.g., "application/pdf", "image/png") */
  mimeType?: string | null;
  /** File size in bytes */
  sizeBytes?: number | null;
  /** Processing status: "PENDING", "PROCESSING", "COMPLETED", "FAILED" */
  processingStatus: string;
  /** Extracted text content (populated after processing) */
  extractedText?: string | null;
  /** ISO 8601 timestamp of upload */
  createdAt: string;
  /** ISO 8601 timestamp of last update */
  updatedAt: string;
}

/**
 * Evidence with Download URL - Extended evidence type with temporary download link
 *
 * Used when retrieving a single evidence item that needs to be downloaded.
 * The download URL is time-limited (typically 60 seconds).
 */
export interface LindexEvidenceWithDownload extends LindexEvidence {
  /** Signed download URL (expires after expiresIn seconds) */
  downloadUrl: string;
  /** Number of seconds until the download URL expires */
  expiresIn: number;
}

/**
 * Evidence Upload Initiation Response
 *
 * Returned when initiating an evidence upload. Contains the signed upload URL
 * that the client should use to upload the file directly to storage.
 */
export interface LindexEvidenceUploadInit {
  /** Newly created evidence ID (UUID) */
  evidenceId: string;
  /** Parent case ID (UUID) */
  caseId: string;
  /** Storage path where file will be stored */
  storagePath: string;
  /** Signed upload URL for client to PUT/POST file to */
  uploadUrl: string;
  /** Upload token (may be required by some storage providers) */
  uploadToken: string;
  /** Number of seconds until the upload URL expires */
  expiresIn: number;
}

/**
 * API Error Response
 *
 * Standard error response format for all API endpoints.
 */
export interface LindexApiError {
  /** Human-readable error message */
  error: string;
  /** Optional error code for programmatic handling */
  code?: string;
  /** Optional additional error details */
  details?: Record<string, any>;
}

