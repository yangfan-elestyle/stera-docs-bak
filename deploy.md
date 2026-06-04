# Deployment Flow (AI preview & verification)

Once the AI is done, it deploys to a CF preview using the locally logged-in `wrangler`; accessing localhost via `bun run dev` is forbidden.

```bash
bun run generate:data              # only needed after clone / when source data changes
bunx opennextjs-cloudflare build   # OpenNext build → .open-next/
bunx opennextjs-cloudflare deploy  # push with the local wrangler login, prints the *.workers.dev preview URL
```

> Preview URL: `https://elepay-docs.<cloudflare-name>.workers.dev`
>
> The flood of esbuild warnings at the tail of `deploy` (third-party libraries, non-fatal) is expected.
