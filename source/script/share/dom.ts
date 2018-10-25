
export interface IHtmlElementInfo {
    name: string;
    attribute?: { [key: string]: string };
    dataset?: { [key: string]: string };
    classNames?: Array<string>;
}

export function createHtmlElement(htmlElementInfo: IHtmlElementInfo): HTMLElement {
    const element = document.createElement(htmlElementInfo.name);

    if(htmlElementInfo.attribute) {
        const attributes = htmlElementInfo.attribute;
        for (const key in attributes) {
            if (attributes[key]) {
                element.setAttribute(key, attributes[key]);
            }
        }
    }

    if (htmlElementInfo.dataset) {
        const dataset = htmlElementInfo.dataset;
        for (const key in dataset) {
            if (dataset[key]) {
                element.dataset[key] = dataset[key];
            }
        }
    }

    if(htmlElementInfo.classNames) {
        for(var value of htmlElementInfo.classNames) {
            element.classList.add(value);
        }
    }

    return element;
}

export function addHtmlElement(baseElement: Element, htmlElementInfo: IHtmlElementInfo): HTMLElement {
    var createdElement = createHtmlElement(htmlElementInfo);
    baseElement.appendChild(createdElement);

    return createdElement;
}

export function addTextNode(baseElement: Element, text: string): Text {
    const createdNode = document.createTextNode(text);
    baseElement.appendChild(createdNode);

    return createdNode;
}
