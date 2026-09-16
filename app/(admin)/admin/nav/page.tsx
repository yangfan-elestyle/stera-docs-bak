import { requireUser } from '@/lib/auth/guard';
import { listNav } from '@/lib/cms/content';
import { saveNavAction } from '../actions';
import { ActionForm } from '../ui';

export default async function NavPage() {
  await requireUser();
  const entries = listNav();

  return (
    <div className="space-y-6">
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">导航 ({entries.length} 份)</h1>
        <p className="text-sm text-fd-muted-foreground">
          侧边栏的分组、排序与分隔符描述 (<code>sectionNotes</code>) 都在这里。
          每种语言各一份, 改一份不影响其他语言。
        </p>
      </div>

      {entries.map((entry) => (
        <section key={`${entry.dir}:${entry.locale}`} className="space-y-2">
          <h2 className="font-mono text-sm">
            {entry.dir || '(根目录)'} · {entry.locale}
          </h2>
          <ActionForm action={saveNavAction} submitLabel="保存">
            <input type="hidden" name="dir" value={entry.dir} />
            <input type="hidden" name="locale" value={entry.locale} />
            <textarea
              name="data"
              defaultValue={JSON.stringify(JSON.parse(entry.data), null, 2)}
              rows={14}
              spellCheck={false}
              className="w-full rounded border border-fd-border bg-fd-card p-3 font-mono text-xs"
            />
          </ActionForm>
        </section>
      ))}
    </div>
  );
}
