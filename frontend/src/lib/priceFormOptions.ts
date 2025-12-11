export const ZIP_STRINGS = [
  "02108",
  "02109",
  "02026",
  "02110",
  "02111",
  "02113",
  "02114",
  "02115",
  "02116",
  "02118",
  "02119",
  "02120",
  "02121",
  "02122",
  "02124",
  "02125",
  "02126",
  "02127",
  "02128",
  "02129",
  "02130",
  "02131",
  "02132",
  "02134",
  "02135",
  "02136",
  "02199",
  "02210",
  "02215",
  "02445",
  "02446",
  "02458",
  "02467",
] as const;

export const ZIP_OPTIONS = ZIP_STRINGS.map((z) => ({
  label: z,
  value: Number(z),
}));

export const isZipString = (zip: string): zip is (typeof ZIP_STRINGS)[number] =>
  ZIP_STRINGS.includes(zip as (typeof ZIP_STRINGS)[number]);

export const AC_OPTIONS = [
  { label: "None", value: -1 },
  { label: "Central AC", value: 2 },
  { label: "Ductless AC", value: 1 },
  { label: "Yes (Other)", value: 0 },
] as const;

export const HEAT_OPTIONS = [
  { label: "Hot Water / Steam", value: -2 },
  { label: "Forced Hot Air", value: 1 },
  { label: "Space Heat", value: -1 },
  { label: "Electric", value: -3 },
  { label: "None", value: 0 },
  { label: "Heat Pump", value: 2 },
  { label: "Other", value: 3 },
] as const;

export const KITCHEN_OPTIONS = [
  { label: "One Person Kitchen", value: 0 },
  { label: "1 Full Eat-In Kitchen", value: 1 },
  { label: "Full Eat-In Kitchen", value: 1 },
  { label: "2 Full Eat-In Kitchens", value: 2 },
  { label: "3 Full Eat-In Kitchens", value: 3 },
  { label: "0 Full Eat-In Kitchens (Kitchenette)", value: -1 },
  { label: "Pullman Kitchen (Narrow/Galley)", value: -2 },
  { label: "No Kitchen", value: -3 },
  { label: "4 Full Eat-In Kitchens", value: 4 },
  { label: "5 Full Eat-In Kitchens", value: 5 },
] as const;
