import { Knex } from "knex";

import { TableName } from "../schemas";
import { createOnUpdateTrigger, dropOnUpdateTrigger } from "../utils";

export async function up(knex: Knex): Promise<void> {
  if (!(await knex.schema.hasTable(TableName.PersonalSecrets))) {
    await knex.schema.createTable(TableName.PersonalSecrets, (t) => {
      t.uuid("personalSecretKeyId", { primaryKey: true }).defaultTo(knex.fn.uuid());
      t.uuid("userId").notNullable().references("id").inTable(TableName.Users).onDelete("CASCADE");
      t.enum("secretType", ["WEB_LOGIN", "CREDITCARD", "SECURE_NOTE"]).notNullable();
      t.string("secretNameCipher").notNullable();
      t.string("secretValueCipher").notNullable();
      t.integer("version").defaultTo(1);
      t.string("secretNameIV").notNullable();
      t.string("secretValueIV").notNullable();
      t.string("secretNameAuthTag").notNullable();
      t.string("secretValueAuthTag").notNullable();
      t.string("algorithm").defaultTo("aes-256-gcm");
      t.uuid("organizationId").notNullable().references("id").inTable(TableName.Organization).onDelete("CASCADE");
      t.dateTime("createdAt").defaultTo(knex.fn.now());
      t.dateTime("updatedAt").defaultTo(knex.fn.now());
    });
  }

  await createOnUpdateTrigger(knex, TableName.PersonalSecrets);
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists(TableName.PersonalSecrets);
  await dropOnUpdateTrigger(knex, TableName.PersonalSecrets);
}
