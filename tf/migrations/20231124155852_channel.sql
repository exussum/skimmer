CREATE TYPE channel_type AS ENUM ('Google', 'Github');

CREATE TABLE "channel" (
    id int4 NOT NULL GENERATED ALWAYS AS IDENTITY( INCREMENT BY 1 MINVALUE 1 MAXVALUE 2147483647 START 1 CACHE 1 NO CYCLE),
    key varchar NOT NULL,
    user_id int4 references "user"(id),
    type channel_type NOT NULL,
    CONSTRAINT channel_pkey PRIMARY KEY (id),
    CONSTRAINT channel_un UNIQUE (user_id, type)
);
