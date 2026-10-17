export function testDatabaseUrl() {
  const value = process.env.TEST_DATABASE_URL;
  try { if (value && new URL(value).pathname.endsWith("_test")) return value; } catch {}
  throw new Error("TEST_DATABASE_URL must identify a separate database whose name ends in _test.");
}
