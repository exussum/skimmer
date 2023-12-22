CREATE TABLE message (
    id int4 NOT NULL GENERATED ALWAYS AS IDENTITY,
    external_id varchar NOT NULL,
    group_id int4 references "group"(id),
    subject varchar NOT NULL,
    body boolean NOT NULL,
    sent timestamp with time zone NOT NULL,
    hidden boolean NOT NULL,
    CONSTRAINT messages_pk PRIMARY KEY (id),
    CONSTRAINT messages_un UNIQUE (external_id, group_id)
);
