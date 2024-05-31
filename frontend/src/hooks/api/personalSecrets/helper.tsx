import crypto from "crypto";

import { decrypt } from "@app/views/UserSecrets/helpers/cryptography";

import { PersonalSecret, UnencryptedPersonalSecret } from "./types";

export const decryption = async (secret: PersonalSecret) => {
  const hashedPrivateKey = await crypto
    .createHash("sha256")
    .update(localStorage.getItem("PRIVATE_KEY") as string)
    .digest();

  return {
    personalSecretKeyId: secret.personalSecretKeyId,
    organizationId: secret.organizationId,
    userId: secret.userId,
    secretType: secret.secretType,
    version: secret.version,
    createdAt: secret.createdAt,
    updatedAt: secret.updatedAt,
    algorithm: secret.algorithm,
    secretName: await decrypt({
      encryptedSecret: secret.secretNameCipher,
      encryptedSecretKeyIV: secret.secretNameIV,
      encryptedSecretKeyTag: secret.secretNameAuthTag,
      secret: hashedPrivateKey
    }),
    secretValue: await decrypt({
      encryptedSecret: secret.secretValueCipher,
      encryptedSecretKeyIV: secret.secretValueIV,
      encryptedSecretKeyTag: secret.secretValueAuthTag,
      secret: hashedPrivateKey
    })
  } as UnencryptedPersonalSecret;
};
