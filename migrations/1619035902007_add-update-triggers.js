/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(
    `CREATE TRIGGER set_inventory_items_updated_at BEFORE UPDATE ON "inventory_items" FOR EACH ROW EXECUTE PROCEDURE on_update_timestamp();`
  );

  pgm.sql(
    `CREATE TRIGGER set_rates_updated_at BEFORE UPDATE ON "rates" FOR EACH ROW EXECUTE PROCEDURE on_update_timestamp();`
  );
};

exports.down = (pgm) => {
  pgm.sql(`DROP TRIGGER set_inventory_items_updated_at ON "inventory_items";`);
  pgm.sql(`DROP TRIGGER set_rates_updated_at ON "rates";`);
};
