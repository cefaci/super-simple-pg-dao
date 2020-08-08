/*
 * Copyright (c) 2016-present, cefaci <25903524+cefaci@users.noreply.github.com>
 *
 * See the LICENSE file at the top-level directory of this distribution
 * for licensing information.
 *
 * Removal or modification of this copyright notice is prohibited.
 */
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

COMMIT;

BEGIN;
set constraints all deferred;
COMMIT;