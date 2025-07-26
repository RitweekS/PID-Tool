export const PIPE_COLORS = [
  { code: "BD", description: "BOOSTER DISCHARGE", value: "#FFCBA4" },
  { code: "CD", description: "CONDENSER DRAIN", value: "#FF00FF" },
  { code: "DC", description: "DEFROST CONDENSATE", value: "#00FF00" },
  { code: "EQ", description: "EQUALIZING", value: "#FFA500" },
  { code: "HSD", description: "HIGH STAGE DISCHARGE", value: "#800080" },
  { code: "HGD", description: "HOT GAS DEFROST", value: "#FFC0CB" },
  { code: "HPL", description: "HIGH PRESSURE LIQUID", value: "#00FFFF" },
  { code: "HSS", description: "HIGH STAGE SUCTION", value: "#FF0000" },
  { code: "HTRL", description: "HIGH STAGE SUCTION", value: "#0000FF" },
  { code: "LTL", description: "LOW TEMP LIQUID", value: "#ADD8E6" },
  { code: "HTRS", description: "H.T. RECIRCULATED SUCTION", value: "#FF007F" },
  { code: "LSS", description: "LOW STAGE SUCTION", value: "#E6E6FA" },
  { code: "LTRL", description: "L.T. RECIRCULATED LIQUID", value: "#FFB6C1" },
  { code: "LTRS", description: "L.T. RECIRCULATED SUCTION", value: "#FFCBA4" },
  { code: "TSR", description: "THERMOSYPHON RETURN", value: "#FF00FF" },
  { code: "TSS", description: "THERMOSYPHON SUPPLY", value: "#00FF00" }
];

export type PipeColor = typeof PIPE_COLORS[0];