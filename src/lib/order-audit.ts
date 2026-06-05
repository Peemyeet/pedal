/** ระบบเก่าไม่มี audit log — คง API ไว้เพื่อไม่ให้ route พัง */
export async function logOrderAudit(
  _orderId: string,
  _payload: {
    adminId?: string | null;
    adminName: string;
    action: string;
    detail?: string | null;
  },
  _tx?: unknown
) {
  return null;
}
