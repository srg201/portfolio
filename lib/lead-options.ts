/** Варианты ответов квиза на /contact: общие для формы и серверной проверки */
export const leadTypes = ["landing", "website", "app", "ecommerce", "other"] as const;
export const leadBudgets = ["s", "m", "l", "xl", "unsure"] as const;
export const leadTimelines = ["asap", "month", "quarter", "flexible"] as const;

export type LeadState =
  | { status: "idle" }
  | { status: "sent" }
  | { status: "invalid"; fields: string[] }
  | { status: "unavailable" }
  | { status: "limited" }
  | { status: "error" };
