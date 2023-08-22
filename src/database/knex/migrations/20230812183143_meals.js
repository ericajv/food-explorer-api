/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
  return knex.schema.createTable("meals", table => {
    table.increments("id");
    table.text("name").notNullable();
    table.double("value").notNullable();
    table.text("description").notNullable();
    table.text("image");

    table.integer("category_id").references("id").inTable("categories");

    table.timestamp("created_at").defaultTo(knex.fn.now());
    table.timestamp("updated_at").defaultTo(knex.fn.now());
  })
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
  return knex.schema.dropTable("meals");
};
