import { TPersonalSecretsInsert } from "@app/db/schemas/personal-secrets";

export type TCreatePersonalSecretDTO = Omit<TPersonalSecretsInsert, "updatedAt" | "createdAt" | "personalSecretKeyId">;
