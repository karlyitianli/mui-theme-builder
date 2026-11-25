const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/;

function emitKey(key: string) {
  return IDENTIFIER.test(key) ? key : emitString(key);
}

function emitString(value: string) {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n')}'`;
}

export function emitTypeScriptValue(
  value: unknown,
  depth = 0,
  references?: ReadonlyMap<unknown, string>,
): string {
  // Known live values (today only the dropdown icon component and its
  // element) emit as source references instead of serialized data. This
  // is an identity lookup for specific values the exporter knows about,
  // not general function serialization; anything else unrecognized still
  // throws below.
  if (references?.has(value)) return references.get(value) as string;
  if (value === null) return 'null';
  if (typeof value === 'string') return emitString(value);
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return `[${value.map((item) => emitTypeScriptValue(item, depth, references)).join(', ')}]`;
  if (typeof value !== 'object') throw new Error(`Cannot emit ${typeof value} as TypeScript.`);

  const entries = Object.entries(value).filter(([, child]) => child !== undefined);
  if (entries.length === 0) return '{}';

  const indent = '  '.repeat(depth + 1);
  const closingIndent = '  '.repeat(depth);
  const properties = entries.map(
    ([key, child]) => `${indent}${emitKey(key)}: ${emitTypeScriptValue(child, depth + 1, references)},`,
  );
  return `{\n${properties.join('\n')}\n${closingIndent}}`;
}
