const ALLOWED_TAGS = new Set(["a", "br", "code", "em", "li", "ol", "p", "strong", "ul"]);
const ALLOWED_ATTRS = new Set(["href", "target", "rel"]);

export function sanitizeHtml(input: string): string {
  if (!input || typeof window === "undefined") return "";
  const template = document.createElement("template");
  template.innerHTML = input;

  const walk = (node: Node) => {
    for (const child of Array.from(node.childNodes)) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const tag = element.tagName.toLowerCase();
        if (!ALLOWED_TAGS.has(tag)) {
          element.replaceWith(document.createTextNode(element.textContent || ""));
          continue;
        }

        for (const attr of Array.from(element.attributes)) {
          const name = attr.name.toLowerCase();
          const value = attr.value.trim().toLowerCase();
          if (!ALLOWED_ATTRS.has(name) || name.startsWith("on") || value.startsWith("javascript:")) {
            element.removeAttribute(attr.name);
          }
        }

        if (tag === "a") {
          element.setAttribute("rel", "noopener noreferrer");
          if (!element.getAttribute("target")) element.setAttribute("target", "_blank");
        }
      }
      walk(child);
    }
  };

  walk(template.content);
  return template.innerHTML;
}
