import { z } from 'zod';
import { insertGameSchema, insertSettingsSchema, insertButtonSchema, insertUserSchema, games, settings, buttons } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  unauthorized: z.object({
    message: z.string(),
  }),
};

export const api = {
  settings: {
    get: {
      method: 'GET' as const,
      path: '/api/settings' as const,
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
      },
    },
    update: {
      method: 'PATCH' as const,
      path: '/api/settings' as const,
      input: insertSettingsSchema.partial(),
      responses: {
        200: z.custom<typeof settings.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
  },
  games: {
    list: {
      method: 'GET' as const,
      path: '/api/games' as const,
      responses: {
        200: z.array(z.custom<typeof games.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/games' as const,
      input: insertGameSchema,
      responses: {
        201: z.custom<typeof games.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/games/:id' as const,
      input: insertGameSchema.partial(),
      responses: {
        200: z.custom<typeof games.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/games/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  buttons: {
    list: {
      method: 'GET' as const,
      path: '/api/buttons' as const,
      responses: {
        200: z.array(z.custom<typeof buttons.$inferSelect>()),
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/buttons' as const,
      input: insertButtonSchema,
      responses: {
        201: z.custom<typeof buttons.$inferSelect>(),
        400: errorSchemas.validation,
      },
    },
    update: {
      method: 'PUT' as const,
      path: '/api/buttons/:id' as const,
      input: insertButtonSchema.partial(),
      responses: {
        200: z.custom<typeof buttons.$inferSelect>(),
        404: errorSchemas.notFound,
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/buttons/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
  },
  auth: {
    login: {
      method: 'POST' as const,
      path: '/api/login' as const,
      input: z.object({
        username: z.string(),
        password: z.string(),
      }),
      responses: {
        200: z.object({ message: z.string() }),
        401: errorSchemas.unauthorized,
      },
    },
    logout: {
      method: 'POST' as const,
      path: '/api/logout' as const,
      responses: {
        200: z.void(),
      },
    },
    check: {
      method: 'GET' as const,
      path: '/api/user' as const,
      responses: {
        200: z.custom<typeof insertUserSchema>().nullable(), // Returns user or null
      },
    },
  },
};

export type InsertGame = z.infer<typeof api.games.create.input>;
export type InsertSettings = z.infer<typeof api.settings.update.input>;

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
