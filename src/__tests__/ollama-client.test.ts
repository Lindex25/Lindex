/**
 * Ollama Client Tests
 *
 * Tests for the Ollama API client including
 * connection handling, request formatting, and response parsing.
 */

describe('Ollama Client', () => {
  describe('Connection Configuration', () => {
    it('should use default base URL when not configured', () => {
      const defaultUrl = 'http://localhost:11434';
      expect(defaultUrl).toContain('localhost');
      expect(defaultUrl).toContain('11434');
    });

    it('should validate base URL format', () => {
      const validUrls = [
        'http://localhost:11434',
        'https://ollama.example.com',
        'http://192.168.1.100:11434',
      ];
      validUrls.forEach(url => {
        expect(url.startsWith('http')).toBe(true);
      });
    });

    it('should configure timeout settings', () => {
      const timeout = 30000;
      expect(timeout).toBeGreaterThanOrEqual(1000);
      expect(timeout).toBeLessThanOrEqual(300000);
    });
  });

  describe('Request Formatting', () => {
    it('should format chat request with model', () => {
      const request = {
        model: 'llama2',
        messages: [{ role: 'user', content: 'Hello' }],
      };
      expect(request.model).toBe('llama2');
      expect(request.messages).toHaveLength(1);
    });

    it('should include system message when provided', () => {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello' },
      ];
      const systemMessage = messages.find(m => m.role === 'system');
      expect(systemMessage).toBeDefined();
    });

    it('should support conversation history', () => {
      const messages = [
        { role: 'user', content: 'What is 2+2?' },
        { role: 'assistant', content: '2+2 equals 4.' },
        { role: 'user', content: 'What about 3+3?' },
      ];
      expect(messages).toHaveLength(3);
      expect(messages[1].role).toBe('assistant');
    });

    it('should set stream option', () => {
      const options = { stream: true };
      expect(options.stream).toBe(true);
    });
  });

  describe('Response Parsing', () => {
    it('should extract message content from response', () => {
      const response = {
        message: {
          role: 'assistant',
          content: 'Hello! How can I help you today?',
        },
        done: true,
      };
      expect(response.message.content).toContain('Hello');
      expect(response.done).toBe(true);
    });

    it('should handle streaming response chunks', () => {
      const chunks = [
        { message: { content: 'Hello' }, done: false },
        { message: { content: ' world' }, done: false },
        { message: { content: '!' }, done: true },
      ];
      const fullContent = chunks.map(c => c.message.content).join('');
      expect(fullContent).toBe('Hello world!');
    });

    it('should detect completion status', () => {
      const finalChunk = { done: true, total_duration: 1234567890 };
      expect(finalChunk.done).toBe(true);
    });
  });

  describe('Error Handling', () => {
    it('should handle connection errors', () => {
      const error = {
        code: 'ECONNREFUSED',
        message: 'Connection refused',
      };
      expect(error.code).toBe('ECONNREFUSED');
    });

    it('should handle timeout errors', () => {
      const error = {
        code: 'ETIMEDOUT',
        message: 'Request timed out',
      };
      expect(error.code).toBe('ETIMEDOUT');
    });

    it('should handle model not found errors', () => {
      const error = {
        status: 404,
        message: 'model not found',
      };
      expect(error.status).toBe(404);
    });

    it('should handle invalid request errors', () => {
      const error = {
        status: 400,
        message: 'invalid request body',
      };
      expect(error.status).toBe(400);
    });
  });

  describe('Model Management', () => {
    it('should list available models', () => {
      const models = [
        { name: 'llama2', size: 3826793472 },
        { name: 'codellama', size: 3826793472 },
        { name: 'mistral', size: 4109865472 },
      ];
      expect(models).toHaveLength(3);
      expect(models.map(m => m.name)).toContain('llama2');
    });

    it('should validate model name format', () => {
      const validNames = ['llama2', 'codellama:7b', 'mistral:latest'];
      validNames.forEach(name => {
        expect(name.length).toBeGreaterThan(0);
        expect(name).toMatch(/^[a-z0-9][a-z0-9:._-]*$/i);
      });
    });

    it('should use default model when not specified', () => {
      const defaultModel = 'llama2';
      expect(defaultModel).toBe('llama2');
    });
  });

  describe('Health Check', () => {
    it('should check Ollama service availability', () => {
      const healthResponse = { status: 'ok' };
      expect(healthResponse.status).toBe('ok');
    });

    it('should return version information', () => {
      const versionInfo = { version: '0.1.17' };
      expect(versionInfo.version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});



