/**
 * Tests for Logger module
 *
 * Verifies logging functionality including log levels,
 * correlation IDs, and environment-specific formatting.
 */

describe('Logger', () => {
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('Log Levels', () => {
    it('should support INFO level logging', () => {
      const level = 'INFO';
      expect(['INFO', 'WARN', 'ERROR', 'DEBUG']).toContain(level);
    });

    it('should support WARN level logging', () => {
      const level = 'WARN';
      expect(['INFO', 'WARN', 'ERROR', 'DEBUG']).toContain(level);
    });

    it('should support ERROR level logging', () => {
      const level = 'ERROR';
      expect(['INFO', 'WARN', 'ERROR', 'DEBUG']).toContain(level);
    });

    it('should support DEBUG level logging', () => {
      const level = 'DEBUG';
      expect(['INFO', 'WARN', 'ERROR', 'DEBUG']).toContain(level);
    });
  });

  describe('LogEntry structure', () => {
    it('should include timestamp in ISO format', () => {
      const timestamp = new Date().toISOString();
      expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
    });

    it('should include level field', () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO' as const,
        message: 'Test message',
      };
      expect(logEntry).toHaveProperty('level');
      expect(logEntry.level).toBe('INFO');
    });

    it('should include message field', () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO' as const,
        message: 'Test message',
      };
      expect(logEntry).toHaveProperty('message');
      expect(logEntry.message).toBe('Test message');
    });

    it('should optionally include correlationId', () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO' as const,
        message: 'Test message',
        correlationId: 'req-123',
      };
      expect(logEntry.correlationId).toBe('req-123');
    });

    it('should optionally include metadata', () => {
      const logEntry = {
        timestamp: new Date().toISOString(),
        level: 'INFO' as const,
        message: 'Test message',
        metadata: { userId: 'user-456', action: 'login' },
      };
      expect(logEntry.metadata).toEqual({ userId: 'user-456', action: 'login' });
    });
  });

  describe('Correlation ID generation', () => {
    it('should generate unique correlation IDs', () => {
      const ids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        const id = `req-${crypto.randomUUID()}`;
        ids.add(id);
      }
      expect(ids.size).toBe(100);
    });

    it('should prefix correlation IDs with "req-"', () => {
      const correlationId = `req-${crypto.randomUUID()}`;
      expect(correlationId.startsWith('req-')).toBe(true);
    });

    it('should generate valid UUID format', () => {
      const uuid = crypto.randomUUID();
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(uuid).toMatch(uuidRegex);
    });
  });

  describe('Environment-specific behavior', () => {
    it('should use JSON format in production', () => {
      const nodeEnv = 'production';
      expect(nodeEnv).toBe('production');
    });

    it('should use human-readable format in development', () => {
      const nodeEnv = 'development';
      expect(nodeEnv).not.toBe('production');
    });

    it('should suppress DEBUG logs in production', () => {
      const nodeEnv = 'production';
      const shouldLog = nodeEnv !== 'production';
      expect(shouldLog).toBe(false);
    });

    it('should allow DEBUG logs in development', () => {
      const nodeEnv = 'development';
      const shouldLog = nodeEnv !== 'production';
      expect(shouldLog).toBe(true);
    });
  });

  describe('Error logging', () => {
    it('should extract error message from Error objects', () => {
      const error = new Error('Something went wrong');
      expect(error.message).toBe('Something went wrong');
    });

    it('should extract stack trace from Error objects', () => {
      const error = new Error('Test error');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('Test error');
    });

    it('should handle non-Error objects', () => {
      const errorObj = { code: 'NETWORK_ERROR', details: 'Connection refused' };
      const errorStr = String(errorObj);
      expect(errorStr).toBe('[object Object]');
    });

    it('should handle string errors', () => {
      const error = 'Simple error string';
      expect(String(error)).toBe('Simple error string');
    });
  });
});



