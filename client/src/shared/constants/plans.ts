export type PlanId = "bft" | "cst";

export const ALLOWED_PLANS: PlanId[] = ["bft", "cst"];

/** Display-only pricing mirror. Authoritative pricing/order amounts are always computed server-side. */
export const PLAN_PRICING: Record<PlanId, Record<number, { paise: number; label: string; save: string }>> = {
  bft: {
    1: { paise: 210000, label: "₹2,100", save: "Save ₹200" },
    3: { paise: 580000, label: "₹5,800", save: "Save ₹1,100" },
    6: { paise: 1080000, label: "₹10,800", save: "Save ₹3,000" },
    12: { paise: 2000000, label: "₹20,000", save: "Save ₹7,600" },
  },
  cst: {
    1: { paise: 230000, label: "₹2,300", save: "Save ₹200" },
    3: { paise: 600000, label: "₹6,000", save: "Save ₹1,500" },
    6: { paise: 1150000, label: "₹11,500", save: "Save ₹3,500" },
    12: { paise: 2200000, label: "₹22,000", save: "Save ₹8,000" },
  },
};

export const TIME_SLOTS = ["05:30", "06:30", "07:30", "17:00", "18:00", "19:00"] as const;
