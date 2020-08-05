BEGIN;

-- CREATE USER test WITH PASSWORD 'test';
-- CREATE DATABASE "test" WITH OWNER = test ENCODING = 'UTF8';

-- *****************************************************************************
-- USER
-- *****************************************************************************
CREATE TABLE IF NOT EXISTS "user" (
  "id"        bigserial NOT NULL, 
  "role_fk"   int4 DEFAULT 0 NOT NULL, 
  "type_fk"   int4 DEFAULT 0 NOT NULL, 
  "name"      varchar(255) NOT NULL, 
  "comment"   varchar(255), 
  "activated" bool DEFAULT false NOT NULL,
  "enabled"   bool DEFAULT false NOT NULL,
  "created"   timestamp(6) DEFAULT now() NOT NULL,
  "updated"   timestamp(6) DEFAULT now(),
  CONSTRAINT "idc_user_pkey" PRIMARY KEY ("id")
)
WITH (OIDS=FALSE)
;
CREATE INDEX        "idx_user_name"      ON "user" USING hash ("name");
CREATE INDEX        "idx_user_type_fk"   ON "user" USING btree ("type_fk") WHERE type_fk <> 0 AND type_fk IS NOT NULL;
CREATE INDEX        "idx_user_role_fk"   ON "user" USING btree ("role_fk") WHERE role_fk <> 0 AND role_fk IS NOT NULL;
CREATE INDEX        "idx_user_activated" ON "user" USING hash ("activated");
CREATE INDEX        "idx_user_enabled"   ON "user" USING hash ("enabled");

-- *****************************************************************************
CREATE TABLE IF NOT EXISTS "user_credential" (
  "id"          bigserial NOT NULL, 
  "user_fk"     int8 NOT NULL, 
  "type_fk"     int4 DEFAULT 0 NOT NULL, 
  "type_key_fk" int4 DEFAULT 0 NOT NULL, 
  "key"         bytea,
  "salt"        bytea,
  "enabled"     bool DEFAULT true NOT NULL,
  "timeout"     int4 NULL,
  "expire"      timestamp(6) NULL,
  "created"     timestamp(6) DEFAULT now() NOT NULL,
  "updated"     timestamp(6) DEFAULT now(),
  CONSTRAINT "idc_user_credential_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "idc_user_credential_user_fk" FOREIGN KEY ("user_fk") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED
);

CREATE        INDEX "idx_user_credential_user_fk"         ON "user_credential" USING btree ("user_fk");
CREATE UNIQUE INDEX "idx_user_credential_user_fk_enabled" ON "user_credential" USING btree ("user_fk") WHERE "enabled" IS TRUE; -- only one active
CREATE        INDEX "idx_user_credential_user_fk_enabled_created_expire" ON "user_credential" USING btree ("user_fk", "enabled", "expire");
CREATE        INDEX "idx_user_credential_type_fk"         ON "user_credential" USING hash ("type_fk") WHERE type_fk <> 0 AND type_fk IS NOT NULL;
CREATE        INDEX "idx_user_credential_type_key_fk"     ON "user_credential" USING hash ("type_key_fk") WHERE type_key_fk <> 0 AND type_key_fk IS NOT NULL;
CREATE        INDEX "idx_user_credential_expire"          ON "user_credential" USING btree ("expire");


-- *****************************************************************************
CREATE TABLE "user_data" (
  "id"      bigserial NOT NULL, 
  "user_fk" int8 NOT NULL, 
  "type_fk" int4 NOT NULL,
  "value"   jsonb,
  "enabled" bool DEFAULT true NOT NULL,
  "created" timestamp(6) DEFAULT now() NOT NULL,
  "updated" timestamp(6) DEFAULT now(),
  CONSTRAINT "idc_user_data_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "idc_user_data_user_fk" FOREIGN KEY ("user_fk") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED
);

CREATE        INDEX "idx_user_data_user_fk" ON "user_data" USING btree ("user_fk");
CREATE        INDEX "idx_user_data_type_fk" ON "user_data" USING btree ("type_fk") WHERE type_fk <> 0 AND type_fk IS NOT NULL;
CREATE        INDEX "idx_user_data_value"   ON "user_data" USING btree ("value");
CREATE        INDEX "idx_user_data_enabled" ON "user_data" USING hash  ("enabled");

-- *****************************************************************************
CREATE TABLE IF NOT EXISTS "auth" (
  "id"        bigserial NOT NULL,
  "user_fk"   int8 NOT NULL, 
  "user_credential_fk"   int8 NOT NULL, 
  "auth"      varchar(255) NOT NULL,
  "auth_hash" bytea NOT NULL,
  "timeout"   int4 NULL,
  "expire"    timestamp(6) NULL,
  "used"      timestamp(6) NULL,
  "updated"   timestamp(6) DEFAULT now(),
  CONSTRAINT "idc_auth_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "idc_auth_user_fk" FOREIGN KEY ("user_fk") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT "idc_auth_user_credential_fk" FOREIGN KEY ("user_credential_fk") REFERENCES "user_credential" ("id") ON DELETE CASCADE ON UPDATE NO ACTION DEFERRABLE INITIALLY DEFERRED
);
CREATE        INDEX "idx_auth_user_fk"   ON "auth" USING btree ("user_fk");
CREATE        INDEX "idx_auth_user_credential_fk"   ON "auth" USING btree ("user_credential_fk");
CREATE        INDEX "idx_auth_auth"      ON "auth" USING hash ("auth")      WHERE "auth"      IS NOT NULL AND "used" IS NULL;
CREATE        INDEX "idx_auth_auth_hash" ON "auth" USING hash ("auth_hash") WHERE "auth_hash" IS NOT NULL AND "used" IS NULL;
CREATE        INDEX "idx_auth_expire"    ON "auth" USING hash ("expire");
CREATE        INDEX "idx_auth_used"      ON "auth" USING hash ("used");

-- *****************************************************************************

COMMIT;
