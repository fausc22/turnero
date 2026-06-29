import { RowDataPacket } from 'mysql2/promise';
import { executeAdminMutation, executeAdminQuery } from '../../config/adminDatabase';

export interface WhatsappSessionStatus {
  connected: boolean;
  phone: string | null;
  updatedAt: Date;
}

export async function getStatus(): Promise<WhatsappSessionStatus> {
  const rows = await executeAdminQuery<
    (RowDataPacket & { connected: number; phone: string | null; updated_at: Date })[]
  >(`SELECT connected, phone, updated_at FROM whatsapp_session_status WHERE id = 1`);
  const row = rows[0];
  return {
    connected: Boolean(row?.connected),
    phone: row?.phone ?? null,
    updatedAt: row?.updated_at ?? new Date(),
  };
}

export async function setConnected(phone: string | null): Promise<void> {
  await executeAdminMutation(
    `UPDATE whatsapp_session_status SET connected = 1, phone = ?, updated_at = NOW() WHERE id = 1`,
    [phone]
  );
}

export async function setDisconnected(): Promise<void> {
  await executeAdminMutation(
    `UPDATE whatsapp_session_status SET connected = 0, phone = NULL, updated_at = NOW() WHERE id = 1`
  );
}
