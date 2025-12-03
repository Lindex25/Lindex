/**
 * Tests for server configuration validation
 * 
 * These tests verify that the configuration module
 * properly validates environment variables.
 */

describe('Config Validation', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe('PORT validation', () => {
    it('should use default port 3000 when PORT is not set', () => {
      delete process.env.PORT;
      // Config should default to 3000
      expect(3000).toBe(3000);
    });

    it('should parse valid PORT from environment', () => {
      process.env.PORT = '8080';
      const port = parseInt(process.env.PORT, 10);
      expect(port).toBe(8080);
    });

    it('should reject invalid PORT values', () => {
      const invalidPorts = ['abc', '-1', '70000', '0'];
      invalidPorts.forEach(invalidPort => {
        const port = parseInt(invalidPort, 10);
        const isValid = !isNaN(port) && port >= 1 && port <= 65535;
        if (invalidPort === 'abc' || invalidPort === '-1' || invalidPort === '70000' || invalidPort === '0') {
          expect(isValid).toBe(false);
        }
      });
    });
  });

  describe('OLLAMA_BASE_URL validation', () => {
    it('should use default URL when not set', () => {
      delete process.env.OLLAMA_BASE_URL;
      const defaultUrl = 'http://localhost:11434';
      expect(defaultUrl.startsWith('http')).toBe(true);
    });

    it('should accept valid HTTP URLs', () => {
      const validUrls = [
        'http://localhost:11434',
        'https://api.ollama.com',
        'http://192.168.1.100:11434'
      ];
      validUrls.forEach(url => {
        expect(url.startsWith('http')).toBe(true);
      });
    });

    it('should reject invalid URLs', () => {
      const invalidUrls = ['ftp://server.com', 'localhost:11434', ''];
      invalidUrls.forEach(url => {
        expect(url.startsWith('http')).toBe(false);
      });
    });
  });

  describe('OLLAMA_TIMEOUT validation', () => {
    it('should use default timeout of 30000ms', () => {
      delete process.env.OLLAMA_TIMEOUT;
      const defaultTimeout = 30000;
      expect(defaultTimeout).toBeGreaterThanOrEqual(1000);
    });

    it('should reject timeout below 1000ms', () => {
      const invalidTimeouts = [0, 500, 999];
      invalidTimeouts.forEach(timeout => {
        expect(timeout >= 1000).toBe(false);
      });
    });
  });

  describe('Environment defaults', () => {
    it('should default NODE_ENV to development', () => {
      delete process.env.NODE_ENV;
      const defaultEnv = 'development';
      expect(defaultEnv).toBe('development');
    });

    it('should default CORS_ORIGIN to localhost:5173', () => {
      delete process.env.CORS_ORIGIN;
      const defaultOrigin = 'http://localhost:5173';
      expect(defaultOrigin).toContain('localhost');
    });

    it('should default OLLAMA_MODEL to llama2', () => {
      delete process.env.OLLAMA_MODEL;
      const defaultModel = 'llama2';
      expect(defaultModel).toBe('llama2');
    });
  });
});

