import { ContainerQ } from "../ContainerQ";
import React, { useRef, useEffect, useState } from "react";
import { Property, Comparison, Unit } from "../types";

const cq = new ContainerQ();

// For debugging purposes
// (window as any).cq2 = cq;

export interface QueryProperties {
  property: keyof typeof Property;
  comparison: keyof typeof Comparison;
  breakpoint: number;
  unit: keyof typeof Unit;
  onQueryActive?: string | Function;
  onQueryInactive?: Function;
  onQueryToggleState?: Function;
}

function useCQ(elementRef: React.MutableRefObject<Element>, queries: QueryProperties[]) {
  let queryIds: React.MutableRefObject<number[]> = useRef([]);

  useEffect(() => {
    for (let query of queries) {
      if (query.onQueryToggleState) {
        query.onQueryActive = () => {
          (query.onQueryToggleState as Function)(true);
        };

        query.onQueryInactive = () => {
          (query.onQueryToggleState as Function)(false);
        };
      }

      if (typeof query.onQueryActive === "string") {
        cq.query(
          elementRef.current,
          query.property,
          query.comparison,
          query.breakpoint,
          query.unit,
          query.onQueryActive,
        );
      } else if (query.onQueryActive) {
        cq.query(
          elementRef.current,
          query.property,
          query.comparison,
          query.breakpoint,
          query.unit,
          query.onQueryActive,
          query.onQueryInactive,
        );
      }
    }

    return () => {
      cq.stopQuerying(elementRef.current);
    };
  }, []);

  return queryIds.current;
}

export { useCQ };
