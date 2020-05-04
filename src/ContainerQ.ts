import { ResizeObserver, ResizeObserverEntry } from "@juggle/resize-observer";

//#region types
enum Unit {
  px,
  rem,
  em,
  "%",
}

enum Comparison {
  "=",
  "<",
  "<=",
  ">",
  ">=",
}

enum Property {
  width,
  height,
}

interface Alteration {
  property: keyof typeof Property;
  comparison: keyof typeof Comparison;
  breakpoint: number;
  unit: keyof typeof Unit;
  onQueryActive: string | Function;
  onQueryInactive: Function | undefined;
  queryId: number;
  active: boolean;
}

interface QueryDescription {
  element: Element;
  alterations: Alteration[];
}
//#endregion

class ContainerQ {
  private _ro: ResizeObserver;
  private _queryList = new Map<Element, Alteration[]>();
  private _querySum = 0;
  private _parents = new Map<Element, Set<Element>>();

  private _compare(n1: number, comparison: keyof typeof Comparison, n2: number) {
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

  private _changeAltActiveState(element: Element, altToToggle: Alteration, activation: boolean) {
    let breakLoop = false;

    for (let alt of this._queryList.get(element) as Alteration[]) {
      if (alt === altToToggle) {
        alt.active = activation;
        break;
      }
    }
  }

  private _evaluateProperty(alt: Alteration, entry: ResizeObserverEntry, size: number) {
    switch (alt.property) {
      case "width":
        if (this._compare(entry.borderBoxSize[0].inlineSize, alt.comparison, size)) {
          if (typeof alt.onQueryActive === "string") entry.target.classList.add(alt.onQueryActive);
          else if (!alt.active) {
            alt.onQueryActive();
          }

          this._changeAltActiveState(entry.target, alt, true);
        } else {
          if (typeof alt.onQueryActive === "string") entry.target.classList.remove(alt.onQueryActive);
          if (typeof alt.onQueryInactive === "function" && alt.active) alt.onQueryInactive();

          this._changeAltActiveState(entry.target, alt, false);
        }
        break;
      case "height":
        if (this._compare(entry.borderBoxSize[0].blockSize, alt.comparison, size)) {
          if (typeof alt.onQueryActive === "string") entry.target.classList.add(alt.onQueryActive);
          else if (!alt.active) {
            alt.onQueryActive();
          }

          this._changeAltActiveState(entry.target, alt, true);
        } else {
          if (typeof alt.onQueryActive === "string") entry.target.classList.remove(alt.onQueryActive);
          if (typeof alt.onQueryInactive === "function" && alt.active) alt.onQueryInactive();

          this._changeAltActiveState(entry.target, alt, false);
        }
        break;
      default:
        break;
    }
  }

  constructor() {
    this._ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const childrenElements = this._parents.get(entry.target);

        childrenElements?.forEach((child) => {
          const alterations = this._queryList.get(child);

          alterations?.forEach((alt) => {
            if (alt.unit === "%") {
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

              if (alt.property === "width") {
                size =
                  ((parent0.offsetWidth -
                    parentPaddingLeft -
                    parentPaddingRight -
                    parentBorderLeft -
                    parentBorderRight) /
                    100) *
                  alt.breakpoint;
              } else {
                size =
                  ((parent0.offsetHeight -
                    parentPaddingTop -
                    parentPaddingBottom -
                    parentBorderTop -
                    parentBorderBottom) /
                    100) *
                  alt.breakpoint;
              }

              this._evaluateProperty(alt, new ResizeObserverEntry(child), size);
            }
          });
        });

        const entryAlerations = this._queryList.get(entry.target);

        entryAlerations?.forEach((alt) => {
          switch (alt.unit) {
            case "px":
              this._evaluateProperty(alt, entry, alt.breakpoint);
              break;
            case "rem":
              const html = document.querySelector("html") as HTMLHtmlElement;
              const fontSizeString = getComputedStyle(html).fontSize;
              const fontSize = Number(fontSizeString.slice(0, -2));

              this._evaluateProperty(alt, entry, fontSize * alt.breakpoint);
              break;
            case "em":
              const parent = (entry.target.parentElement ?? document.querySelector("html")) as Element;
              const parentFontSizeString = getComputedStyle(parent).fontSize;
              const parentFontSize = Number(parentFontSizeString.slice(0, -2));

              this._evaluateProperty(alt, entry, parentFontSize * alt.breakpoint);
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

              if (alt.property === "width") {
                size =
                  ((parent0.offsetWidth -
                    parentPaddingLeft -
                    parentPaddingRight -
                    parentBorderLeft -
                    parentBorderRight) /
                    100) *
                  alt.breakpoint;
              } else {
                size =
                  ((parent0.offsetHeight -
                    parentPaddingTop -
                    parentPaddingBottom -
                    parentBorderTop -
                    parentBorderBottom) /
                    100) *
                  alt.breakpoint;
              }

              this._evaluateProperty(alt, entry, size);
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
    onQueryActive: string | Function,
    onQueryInactive?: Function,
  ): number {
    const queryId = this._querySum;
    this._querySum++;

    const previousAlterations = this._queryList.get(element) ?? [];

    this._queryList.set(element, [
      ...previousAlterations,
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
        const childrenElements = this._parents.get(parentElement) ?? new Set<Element>();
        childrenElements.add(element);
        this._parents.set(parentElement, childrenElements);

        this._ro.observe(parentElement);
      }
    }

    this._ro.observe(element);

    return queryId;
  }

  isQuerying(obj: number): boolean;
  isQuerying(obj: Element): Alteration[] | undefined;
  isQuerying(obj: number | Element): boolean | Alteration[] | undefined {
    if (typeof obj === "number") {
      let exists = false;
      let breakLoop = false;

      for (let alterations of this._queryList.values()) {
        for (let alt of alterations) {
          if (alt.queryId === obj) {
            breakLoop = true;
            exists = true;
            break;
          }
        }
        if (breakLoop) break;
      }

      return exists;
    }

    const alterations = this._queryList.get(obj);
    return alterations;
  }

  stopQuerying(obj: number | Element) {
    if (typeof obj === "number") {
      let breakLoop = false;
      let removeElement = false;
      let elementToMod: Element | undefined = undefined;
      let newAlterations: Alteration[] = [];

      for (let [element, alterations] of this._queryList) {
        let percentageQueries = 0;

        newAlterations = alterations.filter((alt) => {
          if (alt.unit === "%") percentageQueries++;

          if (alt.queryId === obj) {
            elementToMod = element;
            percentageQueries--;
            breakLoop = true;
            return false;
          }
          return true;
        });

        if (percentageQueries === 0) {
          const parent = element.parentElement as Element;
          this._parents.get(parent)?.delete(element);

          if (this._parents.get(parent)?.size === 0) {
            this._parents.delete(parent);
            this._ro.unobserve(parent);
          }
        }

        if (newAlterations.length === 0) removeElement = true;

        if (breakLoop) break;
      }

      if (removeElement && elementToMod) {
        this._queryList.delete(elementToMod);
        this._ro.unobserve(elementToMod);
      } else if (elementToMod) {
        this._queryList.set(elementToMod, newAlterations);
      }
    } else {
      const parent = obj.parentElement as Element;
      this._parents.get(parent)?.delete(obj);

      if (this._parents.get(parent)?.size === 0) {
        this._parents.delete(parent);
        this._ro.unobserve(parent);
      }

      this._queryList.delete(obj);
      this._ro.unobserve(obj);
    }
  }
}

export { ContainerQ };
