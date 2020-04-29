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
  newClass: string;
  queryId: number;
}

interface QueryDescription {
  element: Element;
  alterations: Alteration[];
}
//#endregion

class ContainerQ {
  private _ro: ResizeObserver;
  private _queryList: QueryDescription[] = [];
  private _querySum = 0;

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

  private _evaluateProperty(alt: Alteration, entry: ResizeObserverEntry, size: number) {
    switch (alt.property) {
      case "width":
        if (this._compare(entry.borderBoxSize[0].inlineSize, alt.comparison, size)) {
          entry.target.classList.add(alt.newClass);
        } else entry.target.classList.remove(alt.newClass);
        break;
      case "height":
        if (this._compare(entry.borderBoxSize[0].blockSize, alt.comparison, size)) {
          entry.target.classList.add(alt.newClass);
        } else entry.target.classList.remove(alt.newClass);
        break;
      default:
        break;
    }
  }

  constructor() {
    this._ro = new ResizeObserver((entries) => {
      entries.forEach((entry) => {
        const entryAlerations = this._queryList.find((queryDescription) => {
          return queryDescription.element === entry.target;
        })?.alterations;

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

              if (alt.property === "width") size = (parent0.offsetWidth / 100) * alt.breakpoint;
              else size = (parent0.offsetHeight / 100) * alt.breakpoint;

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
    newClass: string,
  ): number {
    const queryId = this._querySum;
    this._querySum++;

    const queryIndex = this._queryList.findIndex((qd) => qd.element === element);
    if (queryIndex === -1) {
      this._queryList.push({
        element,
        alterations: [{ property, comparison, breakpoint, unit, newClass, queryId }],
      });

      this._ro.observe(element);
    } else {
      this._queryList[queryIndex].alterations.push({ property, comparison, breakpoint, unit, newClass, queryId });
    }

    return queryId;
  }

  isQuerying(obj: number): boolean;
  isQuerying(obj: Element): Alteration[] | undefined;
  isQuerying(obj: number | Element): boolean | Alteration[] | undefined {
    if (typeof obj === "number") {
      let exists = false;
      this._queryList.forEach((qd) => {
        qd.alterations.forEach((alt) => {
          if (alt.queryId === obj) exists = true;
        });
      });

      return exists;
    }

    const alterations = this._queryList.find((qd) => qd.element === obj)?.alterations;

    return alterations;
  }

  stopQuerying(obj: number | Element) {
    if (typeof obj === "number") {
      let stop = false;
      let qdIndex = -1;

      for (let i = 0; i < this._queryList.length; i++) {
        this._queryList[i].alterations = this._queryList[i].alterations.filter((alt) => {
          if (alt.queryId === obj) {
            stop = true;
            return false;
          }
          return true;
        });

        if (this._queryList[i].alterations.length === 0) qdIndex = i;

        if (stop) break;
      }

      if (qdIndex !== -1) {
        this._ro.unobserve(this._queryList[qdIndex].element);
        this._queryList.splice(qdIndex, 1);
      }
    } else {
      this._queryList = this._queryList.filter((qd) => qd.element !== obj);
      this._ro.unobserve(obj);
    }
  }
}

export { ContainerQ };
