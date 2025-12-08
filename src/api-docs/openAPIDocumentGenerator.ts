import { OpenApiGeneratorV3, OpenAPIRegistry } from '@asteasolutions/zod-to-openapi';
import { healthRegistry } from './registries/health.registry';
import { usersRegistry } from './registries/users.registry';
import { projectsRegistry } from './registries/projects.registry';
import { listsRegistry } from './registries/lists.registry';
import type { OpenAPIObject } from 'openapi3-ts/oas30';

export function generateOpenAPIDocument(): OpenAPIObject {
  const registry = new OpenAPIRegistry([
    healthRegistry,
    usersRegistry,
    projectsRegistry,
    listsRegistry,
  ]);
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: '3.0.0',
    info: {
      version: '1.0.0',
      title: 'Swagger API',
    },
    externalDocs: {
      description: 'View the raw OpenAPI Specification in JSON format',
      url: '/swagger.json',
    },
  });
}
