import Aes256Gcm from "@app/components/utilities/cryptography/aes-256-gcm";

export function decrypt({
  encryptedSecret,
  encryptedSecretKeyIV,
  encryptedSecretKeyTag,
  secret
}: {
  encryptedSecret: string;
  encryptedSecretKeyIV: string;
  encryptedSecretKeyTag: string;
  secret: string | Buffer;
}) {
  return Aes256Gcm.decrypt({
    ciphertext: encryptedSecret,
    iv: encryptedSecretKeyIV,
    tag: encryptedSecretKeyTag,
    secret
  });
}

export function encrypt({ text, secret }: { text: string; secret: string | Buffer }) {
  const {
    ciphertext: encryptedSecret,
    iv: encryptedSecretKeyIV,
    tag: encryptedSecretKeyTag
  } = Aes256Gcm.encrypt({
    text,
    secret
  });

  return {
    encryptedSecret,
    encryptedSecretKeyIV,
    encryptedSecretKeyTag
  };
}

export function encryptFields({
  secretValue,
  secretName,
  hashedPrivateKey
}: {
  secretValue: string;
  secretName: string;
  hashedPrivateKey: Buffer | string;
}): {
  secretNameCipher: string;
  secretValueCipher: string;
  secretNameIV: string;
  secretValueIV: string;
  secretNameAuthTag: string;
  secretValueAuthTag: string;
  algorithm: string;
} {
  const encryptedSecretKey = encrypt({
    text: secretName,
    secret: hashedPrivateKey
  });

  const encryptedSecretValue = encrypt({
    text: secretValue,
    secret: hashedPrivateKey
  });

  return {
    secretNameCipher: encryptedSecretKey.encryptedSecret,
    secretValueCipher: encryptedSecretValue.encryptedSecret,
    secretNameIV: encryptedSecretKey.encryptedSecretKeyIV,
    secretValueIV: encryptedSecretValue.encryptedSecretKeyIV,
    secretNameAuthTag: encryptedSecretKey.encryptedSecretKeyTag,
    secretValueAuthTag: encryptedSecretValue.encryptedSecretKeyTag,
    algorithm: "AES-GCM"
  };
}
