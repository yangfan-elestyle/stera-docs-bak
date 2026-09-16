import { NextResponse } from 'next/server';
import { readUpload } from '@/lib/cms/uploads';

// 后台上传的图片存在持久卷上 (public/ 是构建期产物, 运行期写不进去)。
// 文件名是内容哈希, 内容永不变 -> 可以放心长缓存。
export const dynamic = 'force-dynamic';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  const file = await readUpload((await params).name);
  if (!file) return new NextResponse('Not found', { status: 404 });

  return new NextResponse(new Uint8Array(file.body), {
    headers: {
      'Content-Type': file.type,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
