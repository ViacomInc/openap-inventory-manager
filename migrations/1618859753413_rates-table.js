/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("rates", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    updated_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("current_timestamp"),
    },
    rate_key: {
      type: "varchar(255)",
      notNull: true,
    },
    rate: {
      type: "float8",
      notNull: true,
    },
    valid_from: {
      type: "date",
      notNull: true,
    },
    valid_until: {
      type: "date",
      notNull: true,
    },
    rate_type: {
      type: "varchar(255)",
      notNull: true,
      check: "rate_type in ('SCATTER', 'UPFRONT')",
    },
    is_archived: {
      type: "bool",
      notNull: true,
      default: false,
    },
    publisher_id: {
      type: "int4",
      notNull: true,
    },
    created_by: {
      type: "varchar(255)",
      notNull: false,
    },
    updated_by: {
      type: "varchar(255)",
      notNull: false,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("rates");
};
