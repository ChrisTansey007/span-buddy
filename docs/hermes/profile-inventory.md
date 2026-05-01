# Profile and Job Inventory

## Validated Model
- Provider: `openrouter`
- Model: `nvidia/nemotron-3-super-120b-a12b:free`
- Validation evidence: OpenRouter public models endpoint returned `nvidia/nemotron-3-super-120b-a12b:free` as `NVIDIA: Nemotron 3 Super (free)`.
- Policy: use this model for all Span Buddy manager/product-manager cron jobs and Hermes profiles unless the user explicitly changes the system.

## Real Hermes Profiles Created
| Profile | Role | Provider | Model |
|---|---|---|---|
| `span-buddy-product-manager` | Product Manager | `openrouter` | `nvidia/nemotron-3-super-120b-a12b:free` |
| `span-buddy-team1-manager` | Team 1 Manager | `openrouter` | `nvidia/nemotron-3-super-120b-a12b:free` |
| `span-buddy-team2-manager` | Team 2 Manager | `openrouter` | `nvidia/nemotron-3-super-120b-a12b:free` |
| `span-buddy-team3-manager` | Team 3 Manager | `openrouter` | `nvidia/nemotron-3-super-120b-a12b:free` |
| `span-buddy-team4-manager` | Team 4 Manager | `openrouter` | `nvidia/nemotron-3-super-120b-a12b:free` |

## Current Cron Jobs
| Job | Role | Model | Schedule | Workdir |
|---|---|---|---|---|
| `span-buddy-manager-1` | Team 1 Manager | `nvidia/nemotron-3-super-120b-a12b:free` | every 2m | `/tmp/span-buddy` |
| `span-buddy-manager-2` | Team 2 Manager | `nvidia/nemotron-3-super-120b-a12b:free` | every 3m | `/tmp/span-buddy` |
| `span-buddy-manager-3` | Team 3 Manager | `nvidia/nemotron-3-super-120b-a12b:free` | every 5m | `/tmp/span-buddy` |
| `span-buddy-manager-4` | Team 4 Manager | `nvidia/nemotron-3-super-120b-a12b:free` | every 4m | `/tmp/span-buddy` |
| `span-buddy-product-manager` | Product Manager | `nvidia/nemotron-3-super-120b-a12b:free` | every 3m | `/tmp/span-buddy` |

## Notes
- `manager-*-config.md` files are role/persona configuration files.
- The real Hermes profiles above now exist and are configured to use the same validated Nemotron free model.
- Cron jobs also explicitly pin the same model, so scheduled manager runs do not depend on whichever profile is currently active.
