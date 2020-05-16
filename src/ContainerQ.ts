import { ResizeObserver, ResizeObserverEntry } from "@juggle/resize-observer";
import type { QueryInfo, Comparison, Property, Unit } from "./types";

class ContainerQ {
  #ro: ResizeObserver;
  #queryList = new Map<Element, QueryInfo[]>();
  #querySum = 0;
  #parents = new Map<Element, Set<Element>>();

  // @ts-ignore
  #compare(n1: number, comparison: keyof typeof Comparison, n2: number) {
    switch (comparison) {
      case "<":
        return n1 < n2;
      case "<=":
        return n1 <= n2;
      case ">":
        return n1 > n2;
      case ">=":
        return n1 >= n2;
      case "=":
        return n1 === n2;
    }
  }

  // @ts-ignore
  #changeQueryInfoActiveState(element: Element, queryInfoToToggle: QueryInfo, activation: boolean) {
    let breakLoop = false;

    for (let queryInfo of this.#queryList.get(element) as QueryInfo[]) {
      if (queryInfo === queryInfoToToggle) {
        queryInfo.active = activation;
        break;
      }
    }
  }

  // @ts-ignore
  #evaluateProperty(queryInfo: QueryInfo, entry: ResizeObserverEntry, size: number) {
    switch (queryInfo.property) {
      case "width":
        if (this.#compare(entry.borderBoxSize[0].inlineSize, queryInfo.comparison, size)) {
          if (typeof queryInfo.onQueryActive === "string") entry.target.classList.add(queryInfo.onQueryActive);
          else if (!queryInfo.active) {
            queryInfo.onQueryActive();
          }

          this.#changeQueryInfoActiveState(entry.target, queryInfo, true);
        } else {
          if (typeof queryInfo.onQueryActive === "string") entry.target.classList.remove(queryInfo.onQueryActive);
          if (typeof queryInfo.onQueryInactive === "function" && queryInfo.active) queryInfo.onQueryInactive();

          this.#changeQueryInfoActiveState(entry.target, queryInfo, false);
        }
        break;
      case "height":
        if (this.#compare(entry.borderBoxSize[0].blockSize, queryInfo.comparison, size)) {
          if (typeof queryInfo.onQueryActive === "string") entry.target.classList.add(queryInfo.onQueryActive);
          else if (!queryInfo.active) {
            queryInfo.onQueryActive();
          }

          this.#changeQueryInfoActiveState(entry.target, queryInfo, true);
        } else {
          if (typeof queryInfo.onQueryActive === "string") entry.target.classList.remove(queryInfo.onQueryActive);
          if (typeof queryInfo.onQueryInactive === "function" && queryInfo.active) queryInfo.onQueryInactive();

          this.#changeQueryInfoActiveState(entry.target, queryInfo, false);
        }
        break;
      default:
        break;
    }
  }

  constructor() {
    this.#ro = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const childrenElements = this.#parents.get(entry.target);

        childrenElements?.forEach(child => {
          const queryInfoList = this.#queryList.get(child);

          queryInfoList?.forEach(queryInfo => {
            if (queryInfo.unit === "%") {
              const parent0 = child.parentElement as HTMLElement;
              let size = 0;

              const parentPaddingLeft = Number(getComputedStyle(parent0).paddingInlineStart.slice(0, -2));
              const parentPaddingRight = Number(getComputedStyle(parent0).paddingInlineEnd.slice(0, -2));
              const parentPaddingTop = Number(getComputedStyle(parent0).paddingBlockStart.slice(0, -2));
              const parentPaddingBottom = Number(getComputedStyle(parent0).paddingBlockEnd.slice(0, -2));

              const parentBorderLeft = Number(getComputedStyle(parent0).borderInlineStartWidth.slice(0, -2));
              const parentBorderRight = Number(getComputedStyle(parent0).borderInlineEndWidth.slice(0, -2));
              const parentBorderTop = Number(getComputedStyle(parent0).borderBlockStartWidth.slice(0, -2));
              const parentBorderBottom = Number(getComputedStyle(parent0).borderBlockEndWidth.slice(0, -2));

              if (queryInfo.property === "width") {
                size =
                  ((parent0.offsetWidth -
                    parentPaddingLeft -
                    parentPaddingRight -
                    parentBorderLeft -
                    parentBorderRight) /
                    100) *
                  queryInfo.breakpoint;
              } else {
                size =
                  ((parent0.offsetHeight -
                    parentPaddingTop -
                    parentPaddingBottom -
                    parentBorderTop -
                    parentBorderBottom) /
                    100) *
                  queryInfo.breakpoint;
              }

              this.#evaluateProperty(queryInfo, new ResizeObserverEntry(child), size);
            }
          });
        });

        const entryAlerations = this.#queryList.get(entry.target);

        entryAlerations?.forEach(queryInfo => {
          switch (queryInfo.unit) {
            case "px":
              this.#evaluateProperty(queryInfo, entry, queryInfo.breakpoint);
              break;
            case "rem":
              const html = document.querySelector("html") as HTMLHtmlElement;
              const fontSizeString = getComputedStyle(html).fontSize;
              const fontSize = Number(fontSizeString.slice(0, -2));

              this.#evaluateProperty(queryInfo, entry, fontSize * queryInfo.breakpoint);
              break;
            case "em":
              const parent = (entry.target.parentElement ?? document.querySelector("html")) as Element;
              const parentFontSizeString = getComputedStyle(parent).fontSize;
              const parentFontSize = Number(parentFontSizeString.slice(0, -2));

              this.#evaluateProperty(queryInfo, entry, parentFontSize * queryInfo.breakpoint);
              break;
            case "%":
              const parent0 = entry.target.parentElement as HTMLElement;
              let size = 0;

              const parentPaddingLeft = Number(getComputedStyle(parent0).paddingInlineStart.slice(0, -2));
              const parentPaddingRight = Number(getComputedStyle(parent0).paddingInlineEnd.slice(0, -2));
              const parentPaddingTop = Number(getComputedStyle(parent0).paddingBlockStart.slice(0, -2));
              const parentPaddingBottom = Number(getComputedStyle(parent0).paddingBlockEnd.slice(0, -2));

              const parentBorderLeft = Number(getComputedStyle(parent0).borderInlineStartWidth.slice(0, -2));
              const parentBorderRight = Number(getComputedStyle(parent0).borderInlineEndWidth.slice(0, -2));
              const parentBorderTop = Number(getComputedStyle(parent0).borderBlockStartWidth.slice(0, -2));
              const parentBorderBottom = Number(getComputedStyle(parent0).borderBlockEndWidth.slice(0, -2));

              if (queryInfo.property === "width") {
                size =
                  ((parent0.offsetWidth -
                    parentPaddingLeft -
                    parentPaddingRight -
                    parentBorderLeft -
                    parentBorderRight) /
                    100) *
                  queryInfo.breakpoint;
              } else {
                size =
                  ((parent0.offsetHeight -
                    parentPaddingTop -
                    parentPaddingBottom -
                    parentBorderTop -
                    parentBorderBottom) /
                    100) *
                  queryInfo.breakpoint;
              }

              this.#evaluateProperty(queryInfo, entry, size);
              break;
            default:
              break;
          }
        });
      });
    });
  }

  query(
    element: Element,
    property: keyof typeof Property,
    comparison: keyof typeof Comparison,
    breakpoint: number,
    unit: keyof typeof Unit,
    className: string,
  ): number;
  query(
    element: Element,
    property: keyof typeof Property,
    comparison: keyof typeof Comparison,
    breakpoint: number,
    unit: keyof typeof Unit,
    onQueryActive: Function,
    onQueryInactive?: Function,
  ): number;
  query(
    element: Element,
    property: keyof typeof Property,
    comparison: keyof typeof Comparison,
    breakpoint: number,
    unit: keyof typeof Unit,
    onQueryActive: string | Function,
    onQueryInactive?: Function,
  ): number {
    const queryId = this.#querySum;
    this.#querySum++;

    const previousQueryInfoList = this.#queryList.get(element) ?? [];

    this.#queryList.set(element, [
      ...previousQueryInfoList,
      {
        property,
        comparison,
        breakpoint,
        unit,
        onQueryActive,
        onQueryInactive,
        queryId,
        active: false,
      },
    ]);

    if (unit === "%") {
      const parentElement = element.parentElement;

      if (parentElement) {
        const childrenElements = this.#parents.get(parentElement) ?? new Set<Element>();
        childrenElements.add(element);
        this.#parents.set(parentElement, childrenElements);

        this.#ro.observe(parentElement);
      }
    }

    this.#ro.observe(element);

    return queryId;
  }

  isQuerying(queryId: number): QueryInfo | undefined;
  isQuerying(element: Element): QueryInfo[] | undefined;
  isQuerying(obj: number | Element): QueryInfo | QueryInfo[] | undefined {
    if (typeof obj === "number") {
      let queryInfoToReturn: QueryInfo | undefined = undefined;
      let breakLoop = false;

      for (let queryInfoList of this.#queryList.values()) {
        for (let queryInfo of queryInfoList) {
          if (queryInfo.queryId === obj) {
            breakLoop = true;
            queryInfoToReturn = queryInfo;
            break;
          }
        }
        if (breakLoop) break;
      }

      if (queryInfoToReturn) return { ...queryInfoToReturn };
      return queryInfoToReturn;
    }

    const queryInfoList = this.#queryList.get(obj);

    if (queryInfoList) {
      let queryInfoListToReturn: QueryInfo[] = [];
      for (let queryInfo of queryInfoList) {
        queryInfoListToReturn.push({ ...queryInfo });
      }

      return queryInfoListToReturn;
    }

    return queryInfoList;
  }

  stopQuerying(queryId: number): void;
  stopQuerying(element: Element): void;
  stopQuerying(obj: number | Element) {
    if (typeof obj === "number") {
      let breakLoop = false;
      let removeElement = false;
      let elementToMod: Element | undefined = undefined;
      let newQueryInfoList: QueryInfo[] = [];

      for (let [element, queryInfoList] of this.#queryList) {
        let percentageQueries = 0;

        newQueryInfoList = queryInfoList.filter(queryInfo => {
          if (queryInfo.unit === "%") percentageQueries++;

          if (queryInfo.queryId === obj) {
            elementToMod = element;
            percentageQueries--;
            breakLoop = true;
            return false;
          }
          return true;
        });

        if (percentageQueries === 0) {
          const parent = element.parentElement as Element;
          this.#parents.get(parent)?.delete(element);

          if (this.#parents.get(parent)?.size === 0) {
            this.#parents.delete(parent);
            this.#ro.unobserve(parent);
          }
        }

        if (newQueryInfoList.length === 0) removeElement = true;

        if (breakLoop) break;
      }

      if (removeElement && elementToMod) {
        this.#queryList.delete(elementToMod);
        this.#ro.unobserve(elementToMod);
      } else if (elementToMod) {
        this.#queryList.set(elementToMod, newQueryInfoList);
      }
    } else {
      const parent = obj.parentElement as Element;
      this.#parents.get(parent)?.delete(obj);

      if (this.#parents.get(parent)?.size === 0) {
        this.#parents.delete(parent);
        this.#ro.unobserve(parent);
      }

      this.#queryList.delete(obj);
      this.#ro.unobserve(obj);
    }
  }

  stopQueryingAll() {
    this.#ro.disconnect();
    this.#queryList.clear();
    this.#parents.clear();
    this.#querySum = 0;
  }

  // For debugging purposes
  // get querySum() {
  //   return this.#querySum;
  // }

  // get queryList() {
  //   return this.#queryList;
  // }

  // get parents() {
  //   return this.#parents;
  // }

  // get ro() {
  //   return this.#ro;
  // }
}

export { ContainerQ };
