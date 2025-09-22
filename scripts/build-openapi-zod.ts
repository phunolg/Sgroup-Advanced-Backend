import { mkdirSync, writeFileSync } from 'fs';
import { generateOpenAPIDocument } from '../src/api-docs/openAPIDocumentGenerator';

const doc = generateOpenAPIDocument();
mkdirSync('dist', { recursive: true });
writeFileSync('dist/openapi-zod.json', JSON.stringify(doc, null, 2));
console.log('Wrote dist/openapi-zod.json');
