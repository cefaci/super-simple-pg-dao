ABORT;

BEGIN;
set constraints all deferred;

-- *****************************************************************************
-- DROPings
-- *****************************************************************************
-- user
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS "user_credential" CASCADE;
DROP TABLE IF EXISTS "user_data" CASCADE;
DROP TABLE IF EXISTS "auth" CASCADE;

-- *****************************************************************************

DROP SEQUENCE IF EXISTS "master_id_seq";

COMMIT;

BEGIN;
set constraints all deferred;
COMMIT;