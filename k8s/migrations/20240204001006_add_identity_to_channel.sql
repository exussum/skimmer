ALTER TABLE channel DROP CONSTRAINT channel_un;
ALTER TABLE channel ADD "identity" varchar NOT NULL DEFAULT '';
ALTER TABLE channel ADD CONSTRAINT channel_un UNIQUE (user_id, type, identity);
