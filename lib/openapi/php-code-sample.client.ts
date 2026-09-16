'use client';

import { phpCurl } from '@scalar/snippetz/plugins/php/curl';
import type { HarRequest } from '@scalar/snippetz';
import type { CodeUsageGeneratorFn } from 'fumadocs-openapi/requests/generators';

export const phpCodeSample: CodeUsageGeneratorFn = (url, data) => {
  const postData =
    data.bodyMediaType && hasBody(data.body)
      ? toPostData(data.body, data.bodyMediaType)
      : undefined;

  const headers = Object.entries(data.header)
    .filter(([name]) => postData || name.toLowerCase() !== 'content-type')
    .map(([name, param]) => ({
      name,
      value: param.value,
    }));

  if (
    postData &&
    !headers.some((header) => header.name.toLowerCase() === 'content-type')
  ) {
    headers.unshift({
      name: 'Content-Type',
      value: data.bodyMediaType ?? postData.mimeType,
    });
  }

  const snippet = phpCurl.generate({
    method: data.method.toUpperCase(),
    url,
    headers,
    cookies: Object.entries(data.cookie).map(([name, param]) => ({
      name,
      value: param.value,
    })),
    ...(postData ? { postData } : {}),
  });

  return `<?php\n\n${enhancePhpCurlSnippet(snippet)}`;
};

function enhancePhpCurlSnippet(snippet: string): string {
  const lines = snippet.split('\n');

  const returnTransferLine = 'curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);';
  const firstSetoptIdx = lines.findIndex((line) =>
    line.startsWith('curl_setopt('),
  );
  if (firstSetoptIdx >= 0) {
    lines.splice(firstSetoptIdx, 0, returnTransferLine);
  } else {
    const initIdx = lines.findIndex((line) =>
      line.startsWith('$ch = curl_init('),
    );
    if (initIdx >= 0) {
      lines.splice(initIdx + 1, 0, '', returnTransferLine);
    }
  }

  const execIdx = lines.findIndex((line) => line === 'curl_exec($ch);');
  if (execIdx >= 0) {
    lines[execIdx] = '$response = curl_exec($ch);';
  }

  while (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();
  lines.push('', 'echo $response;');

  return lines.join('\n');
}

function toPostData(body: unknown, mediaType: string): HarRequest['postData'] {
  const mimeType = mediaType.split(';', 1)[0].trim().toLowerCase();

  return {
    mimeType: mimeType.endsWith('+json') ? 'application/json' : mimeType,
    text: typeof body === 'string' ? body : JSON.stringify(body),
  };
}

function hasBody(body: unknown): boolean {
  if (body === null || body === undefined) return false;
  if (typeof body === 'string') return body.length > 0;
  if (Array.isArray(body)) return body.length > 0;
  if (typeof body === 'object') return Object.keys(body).length > 0;
  return true;
}
