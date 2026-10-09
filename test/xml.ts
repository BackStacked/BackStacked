import assert from "node:assert/strict";

/**
 * A small well-formedness check: balanced tags, quoted attributes, escaped
 * ampersands. Enough to catch a renderer emitting broken SVG.
 */
export function assertWellFormed(xml: string): void {
  const body = xml.replace(/<style>[\s\S]*?<\/style>/g, "<style/>");
  assert.doesNotMatch(body, /&(?!amp;|lt;|gt;|quot;|#39;|#\d+;)/, "unescaped &");
  const stack: string[] = [];
  for (const [tag, closing, name, selfClosing] of body.matchAll(/<(\/?)([A-Za-z][\w:-]*)(?:\s+[\w:-]+="[^"<]*")*\s*(\/?)>/g)) {
    if (closing) assert.equal(stack.pop(), name, `unexpected ${tag}`);
    else if (!selfClosing) stack.push(name!);
  }
  assert.deepEqual(stack, [], "unclosed tags");
  const tags = body.match(/</g)?.length ?? 0;
  const parsed = [...body.matchAll(/<(\/?)([A-Za-z][\w:-]*)(?:\s+[\w:-]+="[^"<]*")*\s*(\/?)>/g)].length;
  assert.equal(parsed, tags, "a tag did not parse");
}
