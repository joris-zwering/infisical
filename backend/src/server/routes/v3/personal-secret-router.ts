import { z } from "zod";

import { logger } from "@app/lib/logger";
import { readLimit, writeLimit } from "@app/server/config/rateLimiter";
import { verifyAuth } from "@app/server/plugins/auth/verify-auth";
import { AuthMode } from "@app/services/auth/auth-type";

export const registerPersonalSecretRouter = async (server: FastifyZodProvider) => {
  server.route({
    method: "POST",
    url: "/",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      body: z.object({
        secretType: z.enum(["WEB_LOGIN", "CREDITCARD", "SECURE_NOTE"]),
        secretNameCipher: z.string(),
        secretValueCipher: z.string(),
        secretNameIV: z.string(),
        secretValueIV: z.string(),
        secretNameAuthTag: z.string(),
        secretValueAuthTag: z.string()
      })
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const {
        secretType,
        secretNameCipher,
        secretValueCipher,
        secretNameIV,
        secretValueIV,
        secretNameAuthTag,
        secretValueAuthTag
      } = req.body;

      // Get userId and Organization Id from the request
      const userId = req.permission.id;
      const { orgId } = req.auth;

      const newSecret = await server.services.personalSecret.createPersonalSecret({
        userId,
        secretType,
        secretNameCipher,
        secretValueCipher,
        secretNameIV,
        secretValueIV,
        secretNameAuthTag,
        secretValueAuthTag,
        organizationId: orgId
      });

      return newSecret.personalSecretKeyId;
    }
  });

  server.route({
    method: "GET",
    url: "/:id",
    config: {
      rateLimit: readLimit
    },
    schema: {
      params: z.object({
        id: z.string().trim()
      })
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { id: personalSecretId } = req.params;

      // Get userId and Organization Id from the request
      const userId = req.permission.id;
      const { orgId } = req.auth;

      try {
        const secret = await server.services.personalSecret.getPersonalSecret(userId, orgId, personalSecretId);
        return secret;
      } catch (error) {
        logger.error(error);
        throw new Error("Personal secret not found");
      }
    }
  });

  server.route({
    method: "PUT",
    url: "/:id",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      params: z.object({
        id: z.string().trim()
      }),
      body: z.object({
        secretType: z.enum(["WEB_LOGIN", "CREDITCARD", "SECURE_NOTE"]),
        secretNameCipher: z.string(),
        secretValueCipher: z.string(),
        secretNameIV: z.string(),
        secretValueIV: z.string(),
        secretNameAuthTag: z.string(),
        secretValueAuthTag: z.string()
      })
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { id: personalSecretId } = req.params;
      const {
        secretType,
        secretNameCipher,
        secretValueCipher,
        secretNameIV,
        secretValueIV,
        secretNameAuthTag,
        secretValueAuthTag
      } = req.body;

      // Get userId and Organization Id from the request
      const userId = req.permission.id;
      const { orgId } = req.auth;

      try {
        const updatedSecret = await server.services.personalSecret.updatePersonalSecret(
          {
            userId,
            personalSecretKeyId: personalSecretId,
            secretType,
            secretNameCipher,
            secretValueCipher,
            secretNameIV,
            secretValueIV,
            secretNameAuthTag,
            secretValueAuthTag,
            organizationId: orgId
          },
          userId,
          orgId
        );

        return updatedSecret;
      } catch (error) {
        logger.error(error);
        throw new Error("Personal secret not found");
      }
    }
  });

  server.route({
    method: "DELETE",
    url: "/:id",
    config: {
      rateLimit: writeLimit
    },
    schema: {
      params: z.object({
        id: z.string().trim()
      })
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      const { id: personalSecretId } = req.params;

      // Get userId and Organization Id from the request
      const userId = req.permission.id;
      const { orgId } = req.auth;

      try {
        await server.services.personalSecret.deletePersonalSecret(personalSecretId, userId, orgId);
        return {
          success: true
        };
      } catch (error) {
        logger.error(error);
        throw new Error("Personal secret not found");
      }
    }
  });
  server.route({
    method: "GET",
    url: "/",
    config: {
      rateLimit: readLimit
    },
    onRequest: verifyAuth([AuthMode.JWT]),
    handler: async (req) => {
      // Get userId and Organization Id from the request
      const userId = req.permission.id;
      const { orgId } = req.auth;

      try {
        const secrets = await server.services.personalSecret.listPersonalSecrets(orgId, userId);
        return secrets;
      } catch (error) {
        logger.error(error);
        throw new Error("Personal secrets not found");
      }
    }
  });
};
