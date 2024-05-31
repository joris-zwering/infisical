// @typescript-eslint/no-unused-vars
import { type TDbClient } from "@app/db";
import { TableName } from "@app/db/schemas";
import { TPersonalSecrets, TPersonalSecretsInsert } from "@app/db/schemas/personal-secrets";
import { logger } from "@app/lib/logger";

export type TPersonalSecretsDALFactory = ReturnType<typeof personalSecretsDALFactory>;

export const personalSecretsDALFactory = (db: TDbClient) => {
  const create = async (data: TPersonalSecretsInsert): Promise<TPersonalSecrets> => {
    try {
      const [personalSecrets] = await db(TableName.PersonalSecrets).insert(data).returning("*");
      return personalSecrets;
    } catch (error) {
      throw new Error("Personal secrets create error");
    }
  };

  const update = async (id: string, data: Partial<TPersonalSecretsInsert>) => {
    try {
      const [personalSecrets] = await db(TableName.PersonalSecrets)
        .where(`${TableName.PersonalSecrets}.personalSecretKeyId`, id)
        .where(`${TableName.PersonalSecrets}.organizationId`, data.organizationId)
        .where(`${TableName.PersonalSecrets}.userId`, data.userId)
        .update(data)
        .returning("*");
      return personalSecrets;
    } catch (error) {
      logger.error(error);
      throw new Error("Personal secrets update");
    }
  };

  const deleteById = async (id: string, organizationId: string, userId: string) => {
    try {
      await db(TableName.PersonalSecrets)
        .where(`${TableName.PersonalSecrets}.organizationId`, organizationId)
        .where(`${TableName.PersonalSecrets}.userId`, userId)
        .where(`${TableName.PersonalSecrets}.personalSecretKeyId`, id)
        .delete();
    } catch (error) {
      logger.error(error);
      throw new Error("Personal secrets could not be deleted");
    }
  };

  const find = async (personalSecretKeyId: string, organizationId: string, userId: string) => {
    try {
      const personalSecrets = await db(TableName.PersonalSecrets)
        .where(`${TableName.PersonalSecrets}.organizationId`, organizationId)
        .where(`${TableName.PersonalSecrets}.userId`, userId)
        .where(`${TableName.PersonalSecrets}.personalSecretKeyId`, personalSecretKeyId)
        .returning("*")
        .first();
      return personalSecrets;
    } catch (error) {
      logger.error(error);
      throw new Error("Personal secrets find");
    }
  };

  const findAll = async (query: Partial<TPersonalSecrets>) => {
    try {
      const personalSecrets = await db(TableName.PersonalSecrets).where(query).returning("*");
      return personalSecrets;
    } catch (error) {
      logger.error(error);
      throw new Error("Personal secrets find all");
    }
  };

  return { create, deleteById, update, find, findAll };
};
