/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable("import_filters", {
    id: {
      type: "bigserial",
      primaryKey: true,
    },
    type: {
      type: "varchar(255)",
      notNull: true,
      check: "type in ('clamp', 'include', 'exclude')",
    },
    field: {
      type: "varchar(255)",
      notNull: true,
    },
    values: {
      type: "varchar(255)[]",
      notNull: true,
    },
    is_active: {
      type: "bool",
      notNull: true,
      default: true,
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
    created_by: {
      type: "varchar(255)",
      notNull: false,
    },
    updated_by: {
      type: "varchar(255)",
      notNull: false,
    },
  });

  pgm.sql(
    `CREATE TRIGGER set_import_filters_updated_at BEFORE UPDATE ON "import_filters" FOR EACH ROW EXECUTE PROCEDURE on_update_timestamp();`
  );
};

exports.down = (pgm) => {
  pgm.dropTable("import_filters");
};
