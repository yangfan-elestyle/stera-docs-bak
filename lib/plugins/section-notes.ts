// Attach description to separators as meta.sectionNotes
export function sectionNotesPlugin(): any {
  return {
    name: 'elepay:section-notes',
    transformPageTree: {
      folder(this: any, node: any, _folderPath?: string, metaPath?: string) {
        try {
          const meta = metaPath ? this.storage.read(metaPath) : undefined;
          const notes = (
            meta?.format === 'meta'
              ? (meta.data as any)?.sectionNotes
              : undefined
          ) as Record<string, string> | undefined;
          if (!notes) return node;

          const nextChildren = Array.isArray(node.children)
            ? node.children.map((child: any) => {
                if (child?.type === 'separator') {
                  const raw = String(child.name ?? '').trim();
                  const desc =
                    notes[raw] ?? notes[raw.replace(/^---|---$/g, '')];
                  if (desc) return { ...child, description: String(desc) };
                }
                return child;
              })
            : node.children;

          return { ...node, children: nextChildren };
        } catch {
          return node;
        }
      },
    },
  } as any;
}
