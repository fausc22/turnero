import path from 'path';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { upsertSuperUsuario } from '../src/repositories/admin/superUsuarioRepository';

dotenv.config({ path: path.join(__dirname, '../.env') });

const SUPER_EMAIL = 'super@tuturno.local';
const SUPER_PASSWORD = 'SuperAdmin123!';
const SUPER_NAME = 'Super Admin Dev';

async function main() {
  const hash = await bcrypt.hash(SUPER_PASSWORD, 12);
  const id = await upsertSuperUsuario(SUPER_EMAIL, SUPER_NAME, hash);
  console.log(`Super admin listo: ${SUPER_EMAIL} (id=${id})`);
}

main().catch((err) => {
  console.error('Seed super admin failed:', err);
  process.exit(1);
});
