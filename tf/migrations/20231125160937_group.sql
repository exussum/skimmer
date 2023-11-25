CREATE TABLE "group" (
    name varchar NOT NULL,
    id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
    channel_id int4 references channel(id),
    CONSTRAINT groups_pk PRIMARY KEY (id),
    CONSTRAINT groups_un UNIQUE (name,channel_id)
);
