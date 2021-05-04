/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("inventory_items", {
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
    name: { type: "varchar(255)", notNull: true },
    start_datetime: {
      type: "timestamptz",
      notNull: true,
    },
    end_datetime: {
      type: "timestamptz",
      notNull: true,
    },
    valid_until: {
      type: "date",
      notNull: true,
    },
    status: {
      type: "varchar(255)",
      notNull: true,
      check: "status in('New', 'Updated', 'Removed', 'Deleted', 'Committed')",
    },
    network_id: {
      type: "int4",
      notNull: true,
    },
    units: {
      type: "float8",
      notNull: false,
    },
    rate: {
      type: "float8",
      notNull: true,
    },
    rate_key: {
      type: "varchar(255)",
      notNull: false,
    },
    rate_type: {
      type: "varchar(255)",
      notNull: true,
      check: "rate_type in ('SCATTER', 'UPFRONT')",
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
    projections_demographics: {
      type: "varchar(255)",
      notNull: true,
      default: "P2+",
    },
    projected_impressions: {
      type: "float8",
      notNull: true,
      default: 0,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable("inventory_items");
};
