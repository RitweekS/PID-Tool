export const COLORBLIND_COLORS = [
  { code: "CB1", description: "White", value: "#F0F0F0" },
  { code: "CB2", description: "Light Blue", value: "#6BAED6" },
  { code: "CB3", description: "Blue", value: "#2171B5" },
  { code: "CB4", description: "Dark Blue", value: "#08306B" },
  { code: "CB5", description: "Forest Green", value: "#003C30" },
  { code: "CB6", description: "Dark Teal", value: "#01665E" },
  { code: "CB7", description: "Teal", value: "#35978F" },
  { code: "CB8", description: "Light Teal", value: "#80CDC1" },
  { code: "CB9", description: "Lightest Teal", value: "#C7EAE5" },
  { code: "CB10", description: "Lightest Tan", value: "#F6E8C3" },
  { code: "CB11", description: "Light Tan", value: "#DFC27D" },
  { code: "CB12", description: "Tan", value: "#BF812D" },
  { code: "CB13", description: "Brown", value: "#8C510A" },
  { code: "CB14", description: "Dark Brown", value: "#543005" }
];

export type ColorblindColor = typeof COLORBLIND_COLORS[0];