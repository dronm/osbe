-- Table: doc_log

-- DROP TABLE doc_log;

CREATE TABLE doc_log
(
  id serial NOT NULL,
  doc_type doc_types,
  doc_id integer,
  date_time timestamp,
  CONSTRAINT doc_log_pkey PRIMARY KEY (id)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE doc_log OWNER TO ;

-- Index: doc_log_date_time_index

-- DROP INDEX doc_log_date_time_idx;

CREATE INDEX doc_log_date_time_idx ON doc_log USING btree (date_time);

-- Index: doc_log_doc_idx

-- DROP INDEX doc_log_doc_idx;

CREATE INDEX doc_log_doc_idx ON doc_log USING btree (doc_type, doc_id);


