import { headers } from 'next/headers';
import { getTextValue } from '@/lib/tenant-config';

/**
 * md 文件中，不适用于以下标签：
 * 1. #/##/### 〈EText name="xxx" /〉
 * 2. `〈EText name="xxx" /〉`
 * 3. ``` 〈EText name="xxx" /〉 ```
 * 其他 md 标签使用没问题，如：
 * 1. > 〈EText name="xxx" /〉
 * 2. - 〈EText name="xxx" /〉
 * 3. | a | b | 〈EText name="xxx" /〉 |
 * 4. **〈EText name="xxx" /〉**
 */

type Props = {
  name: string;
};

export default async function EText({ name }: Props) {
  const hdrs = await headers();
  const host = hdrs.get('host');
  const value = getTextValue(name, host ?? undefined);
  return <>{value ?? ''}</>;
}
