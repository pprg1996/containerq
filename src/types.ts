export enum Unit {
  px,
  rem,
  em,
  "%",
}

export enum Comparison {
  "=",
  "<",
  "<=",
  ">",
  ">=",
}

export enum Property {
  width,
  height,
}

export interface QueryInfo {
  property: keyof typeof Property;
  comparison: keyof typeof Comparison;
  breakpoint: number;
  unit: keyof typeof Unit;
  onQueryActive: string | Function;
  onQueryInactive?: Function;
  queryId: number;
  active: boolean;
}
