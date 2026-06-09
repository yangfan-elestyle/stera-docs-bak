# Deployment Flow (AI preview & verification)

Once the AI is done, it deploys to a CF preview using the locally logged-in `wrangler`; accessing localhost via `bun run dev` is forbidden.

The site picks its tenant from the request host (`lib/tenant.ts`): a host containing `smcc` renders the **smcc** tenant, otherwise **default**. To verify both, deploy the default URL, then publish the same build under an `smcc` preview alias.

```bash
bun run generate:data                                   # only after clone / when source data changes
bunx opennextjs-cloudflare build                        # OpenNext build → .open-next/
bunx opennextjs-cloudflare deploy                       # default tenant → elepay-docs.<cloudflare-name>.workers.dev
bunx opennextjs-cloudflare upload --preview-alias smcc  # smcc tenant   → smcc-elepay-docs.<cloudflare-name>.workers.dev
```

> Preview URLs:
>
> - default: `https://elepay-docs.<cloudflare-name>.workers.dev`
> - smcc: `https://smcc-elepay-docs.<cloudflare-name>.workers.dev`
>
> The alias is the same Worker reached on a different host, so the `smcc-` prefix is what selects the tenant — no second Worker, no config change.
>
> The tail-end esbuild warnings (third-party libs, non-fatal) are expected.
