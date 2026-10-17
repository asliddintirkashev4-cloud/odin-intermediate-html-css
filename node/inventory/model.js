export function inventoryModel(db) {
  return {
    async categories() { return (await db.query('SELECT c.*,count(i.id)::integer AS items FROM categories c LEFT JOIN inventory_items i ON i.category_id=c.id GROUP BY c.id ORDER BY c.name')).rows; },
    async category(id) { return (await db.query('SELECT * FROM categories WHERE id=$1', [id])).rows[0]; },
    async items(categoryId) { return (await db.query('SELECT i.*,c.name AS category FROM inventory_items i JOIN categories c ON i.category_id=c.id WHERE ($1::integer IS NULL OR c.id=$1) ORDER BY i.name', [categoryId || null])).rows; },
    async item(id) { return (await db.query('SELECT i.*,c.name AS category FROM inventory_items i JOIN categories c ON i.category_id=c.id WHERE i.id=$1', [id])).rows[0]; },
    async saveCategory(id, data) {
      const values = [data.name, data.description];
      if (id) return (await db.query('UPDATE categories SET name=$1,description=$2 WHERE id=$3 RETURNING *', [...values, id])).rows[0];
      return (await db.query('INSERT INTO categories(name,description) VALUES($1,$2) RETURNING *', values)).rows[0];
    },
    async saveItem(id, data) {
      const values = [data.name, data.description, data.categoryId, Math.round(Number(data.price) * 100), data.stock];
      if (id) return (await db.query('UPDATE inventory_items SET name=$1,description=$2,category_id=$3,price_cents=$4,stock=$5 WHERE id=$6 RETURNING *', [...values, id])).rows[0];
      return (await db.query('INSERT INTO inventory_items(name,description,category_id,price_cents,stock) VALUES($1,$2,$3,$4,$5) RETURNING *', values)).rows[0];
    },
    async deleteCategory(id) { return db.query('DELETE FROM categories WHERE id=$1', [id]); },
    async deleteItem(id) { return db.query('DELETE FROM inventory_items WHERE id=$1', [id]); }
  };
}
