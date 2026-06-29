export function parseSchemaSql(sql: string): string[] {
  const statements: string[] = [];
  let delimiter = ';';
  let buffer = '';

  for (const rawLine of sql.split('\n')) {
    const line = rawLine.trim();
    if (!line || line.startsWith('--')) continue;

    const delimMatch = line.match(/^DELIMITER\s+(\S+)$/i);
    if (delimMatch) {
      delimiter = delimMatch[1];
      continue;
    }

    buffer += rawLine + '\n';

    if (buffer.trimEnd().endsWith(delimiter)) {
      const stmt = buffer.trimEnd().slice(0, -delimiter.length).trim();
      if (stmt) statements.push(stmt);
      buffer = '';
    }
  }

  if (buffer.trim()) statements.push(buffer.trim());
  return statements;
}
