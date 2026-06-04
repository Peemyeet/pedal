import type { OrderSource } from "@prisma/client";

export function generateOrderNumber(source: OrderSource) {
  const date = new Date();
  const y = date.getFullYear().toString().slice(-2);
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, "0");
  const prefix = source === "WHOLESALE" ? "WS" : "PD";
  return `${prefix}${y}${m}${d}${rand}`;
}
