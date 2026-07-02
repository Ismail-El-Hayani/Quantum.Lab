# AGENT-RULES.md — hard rules for any subagent run in this workspace

**Every subagent: read this file end-to-end before any tool call. Non-negotiable.**

## 1. Co-Authored-By trailer
NEVER add `Co-Authored-By:` to ANY commit message. Any repo. GitLab OR GitHub. No exceptions.

## 2. Credentials & .env files — the absolute rule
NEVER touch `.env.secrets` or any `.env*` file. Operator manages secrets manually. Files are `git update-index --skip-worktree` protected — never undo.

**An agent NEVER reads, displays, echoes, logs, prints, or pastes the VALUE of any credential, secret, token, key, password, or private signing material** — Vault unseal/root tokens, `KANEKY_CRED_KEY` + derived DEKs, registry/deploy/runner/agent tokens, Keycloak admin & client secrets, DB passwords, S3/MinIO keys, Stripe keys/webhook secrets, Sonar tokens, kanko/x402 signing keys, TLS private keys, WireGuard PSKs, the local `glab` PAT.

In practice:
- Do NOT print/summarise `GET /api/v4/projects/:id/variables` or `/groups/:id/variables` — they return every value. Use the var for the job; never display it.
- Do NOT `vault kv get` a secret path then print it. Do NOT `cat`/`type`/`Get-Content` a `.env`/`.envrc`/`secrets.yaml`. Do NOT `echo $SECRET`.
- Do NOT list CI variable values — not even a truncated prefix. A 40-char prefix is enough to use or correlate. Truncation is not mitigation.
- If tool output incidentally contains a secret, quote only the non-secret parts and mask the rest (`<redacted>`).

When a credential value is genuinely required: (1) ask the user to paste it (it then lives on the provider's servers — one-off throwaway values only), OR (2) flow it through an operator-triggered `bootstrap:*` CI job (generator → secret store, never displayed), OR (3) confirm a key EXISTS without reading its value (variables API `key` field only).

**Incident response if a secret leaks into conversation:** stop the task, name the exposed secret(s), do NOT rotate (user's call), treat it as compromised, help scope blast radius without listing other secrets. Violating this rule is a security incident, not a style nit. (Source of the 2026-05-31 Vault/PII incident; this consolidates the former `AGENTS-RULES.md`.)

## 3. Quality + security first
- Tests on every new code change. Target ≥80% line coverage on touched packages.
- Security review pass before commit:
  - Input validation at every boundary (HTTP body, headers, query params, env, vault read)
  - Parameterised SQL only — never string-concat user input
  - Auth check on every protected endpoint
  - Context propagation on every DB / HTTP / RPC call
  - Cryptographic ops via std/audited libs only
  - Rate / size limits on every public body-accepting endpoint
- No `interface{}` / `any` without comment justification
- Lint clean (`go vet`, `golangci-lint`, language equivalent)
- Build clean
- All existing tests still pass
- No backwards-compat hacks added

## 4. Commit message hygiene
Commit messages describe the CODE CHANGE only. NEVER include:
- Operator billing state ("OpenAI quota exhausted")
- Account specifics, quota numbers, model-tier limits
- Reproduction steps tied to operator runtime environment
- Provider account names tied to specific accounts
- Any runtime-state intel

Pattern: describe the FAILURE CLASS, not the OPERATOR INCIDENT.
- ✅ `fix(handler): classify quota envelope (429) — was matched only by auth-failure heuristic`
- ❌ `fix: surface quota error — operator's OpenAI billing was past due`

## 5. No infra leak in public-facing content
Public content = anything end-user-visible (TikTok shorts, YouTube videos, blog, public docs, public PRs, marketing).

NEVER include in public content:
- Vault paths (`secret/llm/*`, `secret/platforms/*`)
- Cluster IPs (`116.203.39.153`, `91.98.30.45`, WG `10.0.0.x`)
- Operator UUIDs
- Internal service DNS (`*.svc.cluster.local`)
- Real env var names that map to credentials (`KANEKY_OPENAI_KEY`)
- Image registry paths
- Specific Vault role names, NodePorts, namespace specifics

Use fictional in-universe placeholders ("the vault tree", "the obsidian dais glyph", "the host's pet project"). Generic public tech names (Stripe, Postgres, Kubernetes) are fine.

## 6. All hub-visible platforms use Vault via ESO
No hand-seeded k8s secrets for hub-visible platforms. Every secret flows Vault → ExternalSecret → k8s Secret. New platforms bake Vault wiring from day 1.

## 7. Admin tooling stays on gitlab-host VM
GitLab CE, gitlab-runner, SonarQube etc. stay on the VM (91.98.30.45). Cluster = app runtime only. Don't propose migrating admin into k3s.

## 8. Cluster scope
The Hetzner k3s cluster is dev/test (not prod). Claude has standing rights to mutate CI/keys/secrets here. Prod = new domain + new keys (separate decision).

## 9. No cluster drift
Every live `kubectl` / `helm` patch must be mirrored into git in the same session. Never leave cluster state ahead of source.

## 10. All kubectl ops ship as CI jobs
Never leave a "operator run this kubectl one-liner" trail. Wire every op as a cluster CI bootstrap job.

## 11. Tag-only deploys
Only `v[0-9]+.[0-9]+.[0-9]+` tags trigger deploys. Don't push to main expecting an image build.

## 12. Single-agent ownership (split RETIRED 2026-06-29)
The former two-agent split (sibling Claude scoped to `platforms/kaneky/`) is RETIRED. One agent owns ALL code, CI, infra, vault, and cluster files across EVERY repo including `platforms/kaneky/`. No scope handoff, no "sibling's domain." Rule kept as a tombstone so later "per Rule N" references don't shift.

## 13. No local LLMs
All providers are cloud. Local LLM hosting is not the strategy for the agent platform.

## 14. Strict user isolation
Users must never see traces of other users.

## 15. User isolation in shorts (Mikas II)
S01 + S02 self-references to `k.kaneky.dev` ok in dialogue (see [[project_social_channels]] meta-arc rule), but never expose any real operator-runtime detail per Rule 5.

## 16. No Higgsfield credit consumption
Per user: stills via Nano Banana 2 only (unlimited on Plus 7-day trial). Kling 3.0 is NOT free. Never auto-trigger generations that consume credits.

## 18. Cloudflare uses `*.kaneky.dev` wildcard A record
ALL subdomains under kaneky.dev resolve to the cluster IP via a single wildcard A record. Per-platform DNS cleanup on decom is unnecessary — wildcard answers any subdomain regardless of whether it's been used.

**Implications**:
- DON'T list "Cloudflare: delete A record `<platform>.kaneky.dev`" as an operator follow-up on decom — it's a no-op
- Decom'd subdomains still resolve; traffic hits cluster traefik which serves 404 if no ingress, 503 if stale ingress remained
- The TRUE gate against reaching a decom'd platform is removing the cluster Ingress, which the decom pattern already does
- If a platform truly needs DNS-level removal (e.g. revoke a specific cert, prevent scanner enumeration), explicitly create a NEGATIVE record OR firewall block — flag as "needs explicit DNS NEGATIVE record" (not generic "delete A record")

## 17b. Don't ask permission to execute documented operator follow-ups
When the next step is already enumerated as an operator follow-up that I have the access + scope to execute (kubectl on cluster, vault write, cluster yaml edit, CI job add, etc.), DO IT — don't ask again. User confirmation already happened when the task was scoped. Asking again is friction. Only ask if something genuinely unclear (multi-path choice, scope expansion) OR if the action is destructive/irreversible beyond the original scope.

## 17. Kaneky agent — NO default provider, NO default model
Until the user explicitly configures + chooses a provider AND a model in Settings, Kaneky MUST refuse to call any LLM / STT / TTS / image provider. No silent fallback. No "default model" env. No "first available provider" auto-pick. If user hasn't configured: return a clear error pointing them to Settings → Providers.

This applies to:
- Chat / turn endpoints
- Voice STT
- Voice TTS
- Image generation
- Any future provider-backed feature

Per-user table `user_settings.preferred_<feature>_provider` + `preferred_<feature>_model` must be set. If unset → 412 Precondition Failed (or similar) with body `{"error":"provider_unconfigured","message":"Open Settings → Providers to choose a provider and model","feature":"chat|stt|tts|image"}`.

Frontend MUST surface this as a clear "Open Settings" CTA in the same toast/inline-card pattern v1.6.0 introduced for quota errors.

## 19. Test libraries are always-WIP

While working on ANY platform, treat `infrastructure/libraries/java-test`, `infrastructure/libraries/go-test`, and `infrastructure/libraries/ts-test` as live work-in-progress. When platform work surfaces a test helper that another platform will eventually need (Testcontainers wrapper, auth-token mint, MockServer fake, fixture factory, etc.), the change lands in the relevant test library FIRST, then the platform consumes it. NEVER copy a private helper into the platform repo.

Established 2026-05-20. Reason: bewerbr's 12 services each rewrote `BaseIntegrationTest` + `TestcontainersConfig` with slightly different rabbit hostnames — that drift is exactly why the 5-test-jobs-fail-on-port-25672 incident happened.

Workflow:
- Before adding any test helper to a platform repo, check the matching language's library under `infrastructure/libraries/<lang>-test`.
- If reusable (>1 future consumer), build it in the library + cut a tag (`v0.X.Y`) + bump the platform's dependency.
- Genuinely platform-specific helpers (touch one service's domain entities) stay local — flag the exception in the PR description.
- Multiple agents working in parallel should both feel free to extend the library; conflicts on the library are cheaper than diverged copies across platforms.

**Standing release auth (2026-05-22):** any agent (orchestrator OR sub-agent OR sibling Claude) may directly extend a test library AND cut a new tag (`vMAJOR.MINOR.PATCH`) AND publish the release whenever a consumer in their current task needs a helper that doesn't exist yet. No operator confirmation required. Semver: PATCH for bug fixes, MINOR for new helpers, MAJOR for breaking API changes. The release publish step (Maven / npm / Go module proxy) runs from the library repo's tag-triggered CI — never invoke a publish command manually.

## 20. Applications never pull config/creds from the hub
Established 2026-05-25. Applications are STANDALONE. No app may connect to kaneky-hub to fetch config, credentials, models, the platform catalog, or to delegate/invoke other platforms.

The hub's ONLY roles: (1) catalog UI — "show what we have", (2) visibility adjustments, (3) Keycloak-related access/admin functions.

- Each app sources its own secrets from Vault/ESO (or a local encrypted store) — never from hub `/internal/*`.
- Remove `HubCredentialClient`, hub credential proxies, `HUB_BASE_URL` / `KANEKY_HUB_INTERNAL_TOKEN` runtime config, and agent hub-delegation tools.
- Keycloak access-grant *messages* that point a user at the hub ("ask the admin to grant access in kaneky-hub") are FINE — visibility IS the hub's job. Only the runtime config/cred *connection* is banned.
- Applies to ALL platforms, not just kaneky. Pairs with Rule 6 (apps get secrets via Vault/ESO).

## 21. Never rotate data-encryption keys by Vault patch alone
`KANEKY_CRED_KEY` and equivalent app data-encryption keys protect database ciphertext, not just process startup. Changing the Vault value without re-encrypting stored rows makes existing credentials unreadable.

For Kaneky:
- Use `platforms/kaneky/cmd/kaneky-rotate-creds` with old + new keys before rolling the new `KANEKY_CRED_KEY`.
- Run dry-run first and record `total`, `would-rotate`, and `already_dead`.
- If the old key is unavailable, affected rows are unrecoverable by design; the user must re-paste those credentials in the app UI.
- Never "fix" `cipher: message authentication failed` by generating another key. That only compounds data loss.

## 22. Every deployed small tool appears in the minitaska hub
"Small tool" = a no-login single-purpose browser SPA under `spas/<name>/` that follows the minitaska pattern (Next.js 16 static export, AdSense, traefik, nginx, browser-only logic).

Workflow when a small tool reaches a successful CI pipeline (build job green):
1. Add an entry to `spas/minitaska/src/lib/tools.ts` `ACTIVE_TOOLS` with the canonical mark, name, summary, badge, action, detail, tone, and `href: "https://<name>.minitaska.com/"`.
2. Bump the active-tool count assertion in `spas/minitaska/src/lib/tools.test.ts` (and any "Page X of Y" pager assertions in `tests-e2e/home.spec.ts`).
3. Add the mark + href to the `TOOL_LINKS` array in `tests-e2e/navigation.spec.ts`.
4. Add the `<loc>https://<name>.minitaska.com/</loc>` entry to `spas/minitaska/public/sitemap.xml`.
5. Bump the tool count in `spas/minitaska/README.md` ("Lists the N active Minitaska tools ...").
6. Commit + push. Do not skip the test count bump — `tools.test.ts` fails on count drift on purpose.

Standing intent: the hub is the single source of truth for "what ships", so the catalog and the buildable tree must stay in lockstep. The only placeholders (`href: null`) belong in `COMING_SOON_TOOLS`, and they migrate to `ACTIVE_TOOLS` the moment their CI pipeline goes green.

## 23. No Playwright in small tool CI
Small tools (per Rule 22: no-login single-purpose browser SPAs under `spas/<name>/`) do NOT run Playwright e2e tests in CI. The `test:unit` job (node:test + tsx) is the only test surface a small tool ships with.

Implications:
- The `scaffold-tool.ps1` template must not emit a `test:e2e` job in `.gitlab-ci.yml`.
- The shared `spas/ci/build-spa.yml` and `spas/ci/deploy-spa.yml` templates stay free of any e2e stage.
- Only the minitaska hub itself is allowed to run Playwright, and only because the catalog UI is the user-facing surface that needs a real-browser smoke test. The hub's `test:e2e` job carries `allow_failure: true` — e2e surfaces issues, it does not gate deploys.
- If a small tool ever needs browser-level coverage, add a small `node:test` unit test (e.g. jsdom happy-dom) to `src/lib/*.test.ts` instead of standing up a full Playwright run.

## How to invoke

Every subagent prompt begins with:
> "Read `Rules.md` end-to-end before any tool call. Follow all hard rules — non-negotiable."

That's it. Two lines, not 200.

## Where to keep growing this
Add new HARD RULES here, not into per-prompt prose. Reference by number when amending: "per Rule 4 of AGENT-RULES.md".
