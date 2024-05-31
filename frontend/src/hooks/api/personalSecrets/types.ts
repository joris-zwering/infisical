export type PersonalSecret = {
  personalSecretKeyId: string;
  userId: string;
  secretType: "WEB_LOGIN" | "CREDITCARD" | "SECURE_NOTE";
  secretNameCipher: string;
  secretValueCipher: string;
  version: number;
  secretNameIV: string;
  secretValueIV: string;
  secretNameAuthTag: string;
  secretValueAuthTag: string;
  algorithm: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};

export type UnencryptedPersonalSecret = {
  personalSecretKeyId: string;
  userId: string;
  secretType: "WEB_LOGIN" | "CREDITCARD" | "SECURE_NOTE";
  secretName: string;
  secretValue: string;
  version: number;
  algorithm: string;
  organizationId: string;
  createdAt: Date;
  updatedAt: Date;
};
