import { generateOpenAPIDocument } from '../openAPIDocumentGenerator';
import { describe, it, expect } from '@jest/globals';

describe('openAPIDocumentGenerator', () => {
  it('should generate a valid OpenAPI v3 document', () => {
    const doc = generateOpenAPIDocument();
    expect(doc.openapi).toBe('3.0.0');
    expect(doc.info?.title).toBe('Swagger API');
    expect(doc.info?.version).toBe('1.0.0');
  });

  it('should contain health, users and projects paths', () => {
    const doc = generateOpenAPIDocument();
    const paths = Object.keys(doc.paths ?? {});
    expect(paths).toEqual(expect.arrayContaining(['/health', '/api/users', '/api/projects']));
  });

  it('should expose GET /health and GET/POST in /api/users', () => {
    const doc = generateOpenAPIDocument();

    expect(doc.paths?.['/health']?.get).toBeDefined();
    expect(doc.paths?.['/api/users']?.get).toBeDefined();
    expect(doc.paths?.['/api/users']?.post).toBeDefined();
  });
});
