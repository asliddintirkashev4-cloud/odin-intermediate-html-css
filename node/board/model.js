export function messageModel(db) {
  return {
    async all() { return (await db.query('SELECT * FROM board_messages ORDER BY added DESC,id DESC')).rows; },
    async get(id) { return (await db.query('SELECT * FROM board_messages WHERE id=$1', [id])).rows[0]; },
    async create({ user, text }) {
      return (await db.query('INSERT INTO board_messages ("user",text) VALUES ($1,$2) RETURNING *', [user, text])).rows[0];
    }
  };
}
