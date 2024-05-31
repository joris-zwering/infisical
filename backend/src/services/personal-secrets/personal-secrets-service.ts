import { TPersonalSecrets, TPersonalSecretsInsert } from "@app/db/schemas/personal-secrets";
import { BadRequestError, ForbiddenRequestError } from "@app/lib/errors";

import { TPersonalSecretsDALFactory } from "./personal-secrets-dal";

type TPersonalSecretsServiceFactoryDep = {
  personalSecretsDAL: TPersonalSecretsDALFactory;
};

export type TPersonalSecretsServiceFactory = ReturnType<typeof personalSecretsServiceFactory>;

export const personalSecretsServiceFactory = ({ personalSecretsDAL }: TPersonalSecretsServiceFactoryDep) => {
  const createPersonalSecret = async (
    data: Omit<TPersonalSecretsInsert, "updatedAt" | "createdAt" | "personalSecretKeyId">
  ) => {
    try {
      const result = await personalSecretsDAL.create(data);
      return result;
    } catch (error) {
      throw new BadRequestError({ message: "Failed to create personal secret" });
    }
  };

  const updatePersonalSecret = async (
    data: Partial<TPersonalSecretsInsert> & { personalSecretKeyId: string },
    // NOTE: The userId and organizationId should be inferred from the JWT token and not from the request body, so that the integrity of these values is verified!
    userId: string,
    organizationId: string
  ): Promise<TPersonalSecrets | BadRequestError> => {
    const personalSecretData = data as TPersonalSecretsInsert;

    // Checks if the personal secret belongs to the user and organization
    if (personalSecretData.userId !== userId || personalSecretData.organizationId !== organizationId) {
      throw new BadRequestError({ message: "Unauthorized to update personal secret" });
    }

    try {
      const result = await personalSecretsDAL.update(data.personalSecretKeyId, data);
      return result;
    } catch (error) {
      throw new BadRequestError({
        message: "Something went wrong while updating the personal secret in the database."
      });
    }
  };

  const deletePersonalSecret = async (
    personalSecretKeyId: string,
    // The userId and organizationId should be inferred from the JWT token, so that the integrity of these fields is verified!
    userId: string,
    organizationId: string
  ): Promise<"success" | BadRequestError | ForbiddenRequestError> => {
    // Only the user who created the personal secret can update it
    try {
      await personalSecretsDAL.deleteById(personalSecretKeyId, organizationId, userId);
      return "success";
    } catch (error) {
      throw new BadRequestError({
        message: "Something went wrong while deleting the personal secret in the database."
      });
    }
  };

  const getPersonalSecret = async (
    userId: string,
    workspaceId: string,
    personalSecretKeyId: string
  ): Promise<TPersonalSecrets | BadRequestError | ForbiddenRequestError | null> => {
    try {
      const personalSecret = await personalSecretsDAL.find(personalSecretKeyId, workspaceId, userId);
      return personalSecret || null;
    } catch (error) {
      throw new BadRequestError({ message: "Failed to get personal secret. Something went wrong", error });
    }
  };

  const listPersonalSecrets = async (
    organizationId: string,
    userId: string
  ): Promise<TPersonalSecrets[] | BadRequestError | ForbiddenRequestError | null> => {
    try {
      const personalSecrets = await personalSecretsDAL.findAll({
        organizationId,
        userId
      });
      return personalSecrets;
    } catch (error) {
      throw new BadRequestError({ message: "Failed to list personal secrets" });
    }
  };

  return {
    createPersonalSecret,
    updatePersonalSecret,
    deletePersonalSecret,
    getPersonalSecret,
    listPersonalSecrets
  };
};
