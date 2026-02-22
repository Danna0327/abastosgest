import postgres from "postgres"

const sql = postgres(process.env.DATABASE_URL!, {
  ssl: "require",
  connection: {
    options: `--search_path=public`,
  },
  idle_timeout: 20,
  max_lifetime: 1800,
})

export { sql }
