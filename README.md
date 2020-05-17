# ContainerQ

A library to make container/element queries. Add classes or execute an action once an element reaches a desired dimension.

It listens to changes in the dimensions of an element using the ResizeObserver API.

## Installation

    npm i containerq

## Basic usage

    import { ContainerQ } from "containerq";

    const cq = new ContainerQ();
    const container = document.querySelector(".container");
    cq.query(container, "width", ">", 300, "px", "container--big");

This bit of code adds the class "container--big" to the element "container" once its width is greater than 300 pixels and removes the class if it's less than or equal to 300 pixels.

## Methods

**query(element, property, comparison, breakpoint, unit, className): number**

`element: Element`
`property: "width" | "height"`
`comparison: "=" | "<" | "<=" | ">" | ">="`
`breakpoint: number`
`unit: "px" | "rem" | "em" | "%"`
`className: string`

Adds a class to an element if a dimension (width or height) meets a condition and removes the class if the condition is not being met anymore.

_When the percentage (`%`) unit is used the parent element is listened for size changes too._

Example:

`const id = cq.query(container, "width", ">", 300, "px", "container--big");`

Returns a `queryId`, an id number that represents the condition passed to `query()`. Useful if you later want to remove that query or if you want to check if said query exists.

**query(element, property, comparison, breakpoint, unit, onQueryActive, onQueryInactive?): number**

`element: Element`
`property: "width" | "height"`
`comparison: "=" | "<" | "<=" | ">" | ">="`
`breakpoint: number`
`unit: "px" | "rem" | "em" | "%"`
`onQueryActive: Function`
`onQueryInactive?: Function`

Executes the function `onQueryActive` if a dimension (width or height) meets a condition. Optionally, another function, `onQueryInactive`, can be passed to be executed once the desired condition is not being met anymore.

Example:

    function active() {
    	console.log("I'm big")
    }

    function inactive() {
    	console.log("I'm small")
    }

    cq.query(container, "width", ">=", 50, "%", active, inactive);

Returns `queryId`.

**stopQuerying(queryId)**

`queryId: number`

Stops a specific query from an element.

**stopQuerying(element)**

`element: Element`

Stops every query associated to a specific element.

**stopQueryingAll()**

Stops every query of every element in the `ContainerQ` instance.

**isQuerying(queryId): QueryInfo | undefined**

`queryId: number`

    QueryInfo: {
        property: "width" | "height";
        comparison: "=" | "<" | "<=" | ">" | ">=";
        breakpoint: number;
        unit: "px" | "rem" | "em" | "%";
        onQueryActive: string | Function;
        onQueryInactive?: Function;
        queryId: number;
        active: boolean;
    }

Receives the id of a query and returns the `QueryInfo` object of that query. It has information about a specific query.

Returns `undefined` if the id is not associated to any query or if its associated query was removed via the `stopQuerying` method.

`onQueryActive` is a string if a `className` string is passed to the `query` method. Likewise if a function was passed then `onQueryActive` will be a function.

The `active` property is a boolean indicating if the condition of the pertaining query is true or false at the moment.

Example:

    const id = cq.query(container, "width", ">", 300, "px", "container--big");

    console.log(cq.isQuerying(id).property) //width

    cq.stopQuerying(id);

    console.log(cq.isQuerying(id)) //undefined

**isQuerying(element): QueryInfo[] | undefined**

`element: Element`

Takes an Element and returns an array of every `QueryInfo` object associated to the Element.

Returns `undefined` if no queries are associated with the passed Element.

Example:

    cq.query(container, "height", "<", 10, "rem", "container--short");
    cq.query(container, "width", ">=", 550, "px", "container--wide");

    console.log(cq.isQuerying(container)) //[{...}, {...}]

## React Hook

**useCQ(elementRef, queries)**

`elementRef: React.MutableRefObject<Element>`
`queries: QueryProperties[]`

    QueryProperties: {
        property: "width" | "height";
        comparison: "=" | "<" | "<=" | ">" | ">=";
        breakpoint: number;
        unit: "px" | "rem" | "em" | "%";
        onQueryActive?: string | Function;
        onQueryInactive?: Function;
        onQueryToggleState?: Function;
    }

Example:

    import { useCQ } from  "containerq";

    function  MyComponent() {
        const [wideSize, setWideSize] = useState(false);
        const [shortSize, setShortSize] = useState(false);
        const  divRef= useRef();

        useCQ(divRef, [
    	    { property: "width", comparison: ">", breakpoint: 60, unit: "%", onQueryToggleState: setWideSize },
    	    { property: "height", comparison: "<=", breakpoint: 30, unit: "%", onQueryToggleState: setShortSize }
        ]);

        return (
    	    <div ref={divRef}>
    		    <SubComponent1 isWideSize={wideSize} />
    		    <SubComponent2 isWideSize={wideSize} />
    		    <SubComponent3 isShortSize={shortSize} />
    	    </div>
        );
    }
    // The first two subcomponents react to the parent container being wide
    // The last subcomponent reacts to the parent container being short

The `queries` object of type `QueryProperties` has properties very similar to the `query` method's parameters. The only difference is the property `onQueryToggleState` which takes a function that's called with `true` as an argument when the query's condition is being met, otherwise is called with `false` as the argument.

The idea is to use `onQueryToggleState` alongside `useState` but you could come up with different ways of using it.

There is no need to create a `ContainerQ` instance when using the hook because an instance is created when `useCQ` is imported. Also, the queries associated with the hook are cleared automatically when the component gets unmounted.
