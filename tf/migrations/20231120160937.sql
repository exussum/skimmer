CREATE TABLE "groups" (
    name varchar NOT NULL,
    id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
    user_id int4 NOT NULL,
    CONSTRAINT groups_pk PRIMARY KEY (id),
    CONSTRAINT groups_un UNIQUE (name,user_id)
);
