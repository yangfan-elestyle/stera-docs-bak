import { NextResponse } from 'next/server';
import { getDb } from '@/lib/cms/db';

// 容器 healthcheck 用: 只验 db 可读, 不碰内容编译 / 搜索索引 -> 探活不放大成整站负载。
// MUST force-dynamic: 否则 next build 会预渲染它, 构建期连库 (见 getDb 的懒加载约束)。
export const dynamic = 'force-dynamic';

export function GET() {
  try {
    getDb().prepare('SELECT 1 FROM docs LIMIT 1').get();
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('[health] db 不可读', error);
    return NextResponse.json({ ok: false }, { status: 503 });
  }
}
