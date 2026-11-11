# Free model benchmark — 2026-11-10

Router: `http://127.0.0.1:31415` · models tested: **101** · answered correctly: **69** · failed: **32**

## Method

- Probe: `Answer with just the number, nothing else: 17 x 23 = ?` (temperature 0, 600 max tokens)
- Vision probe (vision models only): 64x64 solid red PNG, `What color is this image?`
- Metrics: correct answer, exact instruction compliance, reasoning leakage, latency, capability flags
- Score = 45 correct + 20 exact + 10 clean + up to 15 speed + 5 tools + 3 vision pass
- One-shot: free tiers are volatile; a 429/502 can be congestion, not model quality.

## Top 25 (chat-capable)

| # | Score | Model | Provider | Latency | Ctx | Vision | Tools |
|---|-------|-------|----------|---------|-----|--------|-------|
| 1 | **98** | `@cf/mistralai/mistral-small-3.1-24b-instruct` | cloudflare | 758ms | 128k | PASS | yes |
| 2 | **97** | `openrouter/free` | kilo | 837ms | 195k | PASS | yes |
| 3 | **97** | `@cf/qwen/qwen3.8-27b` | cloudflare | 2336ms | 256k | PASS | yes |
| 4 | **95** | `Mistral-Small-3.2-24B-Instruct-2506` | ovh | 319ms | 128k | - | yes |
| 5 | **95** | `poolside/laguna-xs-2.1` | nvidia | 371ms | 256k | - | yes |
| 6 | **95** | `command-r7b-12-2024` | cohere | 492ms | 128k | - | yes |
| 7 | **95** | `command-r7b-arabic-02-2025` | cohere | 535ms | 125k | - | yes |
| 8 | **95** | `command-a-plus-05-2026` | cohere | 582ms | 128k | WRONG | yes |
| 9 | **95** | `command-r-08-2024` | cohere | 611ms | 128k | - | yes |
| 10 | **95** | `@cf/openai/gpt-oss-120b` | cloudflare | 644ms | 128k | - | yes |
| 11 | **95** | `openai/gpt-oss-120b` | groq | 658ms | 128k | - | yes |
| 12 | **95** | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | cloudflare | 664ms | 23k | - | yes |
| 13 | **95** | `Meta-Llama-3_3-70B-Instruct` | ovh | 682ms | 128k | - | yes |
| 14 | **95** | `gpt-oss-120b` | ovh | 708ms | 128k | - | yes |
| 15 | **95** | `dots-studio/dots-3-note-preview:free` | openrouter | 4321ms | 500k | PASS | yes |
| 16 | **95** | `dots-studio/dots-3-note-preview:free` | kilo | 4729ms | 500k | PASS | yes |
| 17 | **94** | `command-r-plus-08-2024` | cohere | 834ms | 128k | - | yes |
| 18 | **94** | `cohere/north-mini-code:free` | kilo | 886ms | 250k | - | yes |
| 19 | **94** | `command-a-03-2025` | cohere | 924ms | 128k | - | yes |
| 20 | **94** | `@cf/meta/llama-4-scout-17b-16e-instruct` | cloudflare | 1004ms | 128k | - | yes |
| 21 | **94** | `nvidia/nemotron-3-ultra-550b-a55b:free` | kilo | 1211ms | 977k | - | yes |
| 22 | **94** | `cohere/north-mini-code:free` | openrouter | 1231ms | 250k | - | yes |
| 23 | **94** | `openai/gpt-oss-20b` | nvidia | 1907ms | 128k | - | yes |
| 24 | **94** | `gemini-3.5-flash-lite` | custom | 1910ms | 0k | - | yes |
| 25 | **94** | `north-mini-code-1-0` | cohere | 1914ms | 250k | - | yes |

## Vision leaderboard

| Result | Model | Provider | Latency | Ctx |
|--------|-------|----------|---------|-----|
| PASS | `Qwen2.5-VL-72B-Instruct` | ovh | 361ms | 32k |
| PASS | `@cf/mistralai/mistral-small-3.1-24b-instruct` | cloudflare | 758ms | 128k |
| PASS | `openrouter/free` | kilo | 837ms | 195k |
| PASS | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | kilo | 1313ms | 250k |
| PASS | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | nvidia | 1863ms | 256k |
| PASS | `@cf/qwen/qwen3.8-27b` | cloudflare | 2336ms | 256k |
| PASS | `dots-studio/dots-3-note-preview:free` | openrouter | 4321ms | 500k |
| PASS | `dots-studio/dots-3-note-preview:free` | kilo | 4729ms | 500k |
| PASS | `qwen/qwen3.8-27b` | groq | 21054ms | 256k |
| PASS | `meta/muse-glimmer-30b` | nvidia | 30056ms | 128k |
| ERR429 | `glm-4.6v-flash` | zhipu | 7ms | 128k |
| ERR429 | `@cf/llava-hf/llava-1.5-7b-hf` | cloudflare | 464ms | 4k |
| WRONG | `c4ai-aya-vision-32b` | cohere | 489ms | 16k |
| WRONG | `command-a-vision-07-2025` | cohere | 495ms | 125k |
| WRONG | `command-a-plus-05-2026` | cohere | 582ms | 128k |
| ERR429 | `@cf/meta/llama-3.2-11b-vision-instruct` | cloudflare | 714ms | 128k |
| WRONG | `nvidia/nemotron-parse-2.0` | nvidia | 971ms | 0k |
| ERR429 | `@cf/moondream/moondream3.1-9B-A2B` | cloudflare | 1513ms | 32k |
| ERR429 | `google/diffusiongemma-26b-a4b-it` | nvidia | 3565ms | 256k |
| ERR0 | `meta/llama-3.2-90b-vision-instruct` | nvidia | 75017ms | 128k |
| ERR0 | `nvidia/ising-calibration-1.5-31b` | nvidia | 75019ms | 128k |

## Failures

| Model | Provider | Status | Note |
|-------|----------|--------|------|
| `@cf/qwen/qwen3-30b-a3b-fp8` | cloudflare | 502 | router upstream error / empty completion |
| `google/gemma-4-31b-it:free` | openrouter | 502 | router upstream error / empty completion |
| `google/gemma-4-26b-a4b-it:free` | openrouter | 502 | router upstream error / empty completion |
| `nvidia/nemotron-3-super-120b-a12b` | nvidia | 404 | model retired upstream |
| `glm-4.6v-flash` | zhipu | 429 | rate limited (free tier congestion) |
| `@cf/llava-hf/llava-1.5-7b-hf` | cloudflare | 400 | unsupported request |
| `@cf/meta/llama-3.2-11b-vision-instruct` | cloudflare | 502 | router upstream error / empty completion |
| `@cf/meta/llama-guard-3-8b` | cloudflare | 200 | non-chat / guard model |
| `@cf/mistral/mistral-7b-instruct-v0.2-lora` | cloudflare | 200 | no correct answer |
| `@cf/moondream/moondream3.1-9B-A2B` | cloudflare | 502 | router upstream error / empty completion |
| `@cf/qwen/qwen2.5-coder-32b-instruct` | cloudflare | 502 | router upstream error / empty completion |
| `@cf/meta-llama/llama-2-7b-chat-hf-lora` | cloudflare | 502 | router upstream error / empty completion |
| `meta-llama/llama-prompt-guard-2-22m` | groq | 413 | prompt rejected (guard model) |
| `meta-llama/llama-prompt-guard-2-86m` | groq | 413 | prompt rejected (guard model) |
| `@cf/qwen/qwq-32b` | cloudflare | 502 | router upstream error / empty completion |
| `google/diffusiongemma-26b-a4b-it` | nvidia | 502 | router upstream error / empty completion |
| `meta/llama-3.2-90b-vision-instruct` | nvidia | timeout | timeout / no response |
| `nvidia/ising-calibration-1.5-31b` | nvidia | timeout | timeout / no response |
| `nvidia/llama-3.1-nemoguard-8b-topic-control` | nvidia | 502 | router upstream error / empty completion |
| `nvidia/llama-3.1-nemotron-safety-guard-8b-v3` | nvidia | 200 | non-chat / guard model |
| `nvidia/nemotron-3.5-content-safety` | nvidia | 404 | model retired upstream |
| `nvidia/llama-3.1-nemoguard-8b-content-safety` | nvidia | timeout | timeout / no response |
| `nvidia/riva-translate-4b-instruct-v2` | nvidia | 200 | non-chat / guard model |
| `nvidia/nemotron-parse-2.0` | nvidia | 200 | non-chat / guard model |
| `liquid/lfm-2.5-2.6b:free` | openrouter | 502 | router upstream error / empty completion |
| `Qwen3Guard-Gen-0.6B` | ovh | 200 | non-chat / guard model |
| `Qwen3Guard-Gen-8B` | ovh | 200 | non-chat / guard model |
| `gemini-3.8-flash` | custom | 502 | router upstream error / empty completion |
| `gemini-flash-latest` | custom | 502 | router upstream error / empty completion |
| `gpt-oss-20b` | ovh | timeout | timeout / no response |
| `gemini-3.7-flash` | custom | 502 | router upstream error / empty completion |
| `gemini-3.5-flash` | custom | timeout | timeout / no response |

## Per-provider summary

| Provider | Models | Answered | Avg score | Avg latency |
|----------|--------|----------|-----------|-------------|
| kilo | 7 | 7 | 93.7 | 2805ms |
| cohere | 17 | 17 | 89.9 | 869ms |
| groq | 7 | 5 | 69.7 | 3702ms |
| ovh | 11 | 8 | 68.4 | 16811ms |
| cloudflare | 26 | 17 | 62.0 | 5862ms |
| openrouter | 7 | 4 | 59.6 | 2390ms |
| zhipu | 3 | 2 | 52.7 | 6832ms |
| custom | 7 | 3 | 45.6 | 18045ms |
| nvidia | 16 | 6 | 40.9 | 17484ms |

## Full results

| Score | Model | Provider | Status | Latency | Ctx | Vision | Tools | Leak |
|-------|-------|----------|--------|---------|-----|--------|-------|------|
| 98 | `@cf/mistralai/mistral-small-3.1-24b-instruct` | cloudflare | 200 | 758ms | 128k | PASS | Y | - |
| 97 | `openrouter/free` | kilo | 200 | 837ms | 195k | PASS | Y | - |
| 97 | `@cf/qwen/qwen3.8-27b` | cloudflare | 200 | 2336ms | 256k | PASS | Y | - |
| 95 | `openai/gpt-oss-safeguard-20b` | groq | 200 | 305ms | 128k | - | Y | - |
| 95 | `Mistral-Small-3.2-24B-Instruct-2506` | ovh | 200 | 319ms | 128k | - | Y | - |
| 95 | `poolside/laguna-xs-2.1` | nvidia | 200 | 371ms | 256k | - | Y | - |
| 95 | `command-r7b-12-2024` | cohere | 200 | 492ms | 128k | - | Y | - |
| 95 | `command-a-translate-08-2025` | cohere | 200 | 522ms | 250k | - | Y | - |
| 95 | `command-r7b-arabic-02-2025` | cohere | 200 | 535ms | 125k | - | Y | - |
| 95 | `command-a-plus-05-2026` | cohere | 200 | 582ms | 128k | WRONG | Y | - |
| 95 | `command-r-08-2024` | cohere | 200 | 611ms | 128k | - | Y | - |
| 95 | `@cf/openai/gpt-oss-120b` | cloudflare | 200 | 644ms | 128k | - | Y | - |
| 95 | `openai/gpt-oss-120b` | groq | 200 | 658ms | 128k | - | Y | - |
| 95 | `@cf/meta/llama-3.3-70b-instruct-fp8-fast` | cloudflare | 200 | 664ms | 23k | - | Y | - |
| 95 | `Meta-Llama-3_3-70B-Instruct` | ovh | 200 | 682ms | 128k | - | Y | - |
| 95 | `gpt-oss-120b` | ovh | 200 | 708ms | 128k | - | Y | - |
| 95 | `dots-studio/dots-3-note-preview:free` | openrouter | 200 | 4321ms | 500k | PASS | Y | - |
| 95 | `dots-studio/dots-3-note-preview:free` | kilo | 200 | 4729ms | 500k | PASS | Y | - |
| 94 | `command-r-plus-08-2024` | cohere | 200 | 834ms | 128k | - | Y | - |
| 94 | `cohere/north-mini-code:free` | kilo | 200 | 886ms | 250k | - | Y | - |
| 94 | `command-a-03-2025` | cohere | 200 | 924ms | 128k | - | Y | - |
| 94 | `@cf/meta/llama-4-scout-17b-16e-instruct` | cloudflare | 200 | 1004ms | 128k | - | Y | - |
| 94 | `nvidia/nemotron-3-ultra-550b-a55b:free` | kilo | 200 | 1211ms | 977k | - | Y | - |
| 94 | `cohere/north-mini-code:free` | openrouter | 200 | 1231ms | 250k | - | Y | - |
| 94 | `openai/gpt-oss-20b` | nvidia | 200 | 1907ms | 128k | - | Y | - |
| 94 | `gemini-3.5-flash-lite` | custom | 200 | 1910ms | 0k | - | Y | - |
| 94 | `north-mini-code-1-0` | cohere | 200 | 1914ms | 250k | - | Y | - |
| 93 | `Qwen2.5-VL-72B-Instruct` | ovh | 200 | 361ms | 32k | PASS | - | - |
| 93 | `nvidia/nemotron-3-ultra-550b-a55b` | nvidia | 200 | 2711ms | 1024k | - | Y | - |
| 93 | `gemini-3.6-flash` | custom | 200 | 2965ms | 0k | - | Y | - |
| 93 | `nvidia/nemotron-3.5-lightning:free` | kilo | 200 | 3287ms | 1024k | - | Y | - |
| 93 | `openai/gpt-oss-20b` | groq | 200 | 3661ms | 128k | - | Y | - |
| 93 | `glm-4.7-flash` | zhipu | 200 | 3828ms | 128k | - | Y | - |
| 93 | `@cf/zai-org/glm-4.7-flash` | cloudflare | 200 | 3992ms | 128k | - | Y | - |
| 92 | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | kilo | 200 | 1313ms | 250k | PASS | - | - |
| 92 | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning` | nvidia | 200 | 1863ms | 256k | PASS | - | - |
| 92 | `@cf/openai/gpt-oss-20b` | cloudflare | 200 | 4422ms | 128k | - | Y | - |
| 91 | `kilo-auto/free` | kilo | 200 | 7371ms | 250k | - | Y | - |
| 90 | `allam-2-7b` | groq | 200 | 229ms | 4k | - | - | - |
| 90 | `tiny-aya-fire` | cohere | 200 | 418ms | 8k | - | - | - |
| 90 | `north-small-translate-09-2026` | cohere | 200 | 422ms | 32k | - | - | - |
| 90 | `tiny-aya-global` | cohere | 200 | 422ms | 8k | - | - | - |
| 90 | `tiny-aya-water` | cohere | 200 | 428ms | 8k | - | - | - |
| 90 | `tiny-aya-earth` | cohere | 200 | 434ms | 8k | - | - | - |
| 90 | `@cf/meta/llama-3.2-3b-instruct` | cloudflare | 200 | 473ms | 128k | - | - | - |
| 90 | `c4ai-aya-vision-32b` | cohere | 200 | 489ms | 16k | WRONG | - | - |
| 90 | `command-a-vision-07-2025` | cohere | 200 | 495ms | 125k | WRONG | - | - |
| 90 | `c4ai-aya-expanse-32b` | cohere | 200 | 586ms | 128k | - | - | - |
| 90 | `@cf/aisingapore/gemma-sea-lion-v4-27b-it` | cloudflare | 200 | 599ms | 128k | - | - | - |
| 90 | `@cf/meta/llama-3.1-8b-instruct-fp8` | cloudflare | 200 | 8093ms | 128k | - | Y | - |
| 90 | `Qwen3.5-9B` | ovh | 200 | 9057ms | 256k | - | Y | - |
| 89 | `@cf/ibm-granite/granite-4.0-h-micro` | cloudflare | 200 | 1187ms | 128k | - | - | - |
| 89 | `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free` | openrouter | 200 | 1485ms | 256k | - | - | - |
| 89 | `@cf/meta/llama-3.2-1b-instruct` | cloudflare | 200 | 1557ms | 128k | - | - | - |
| 89 | `@cf/nvidia/nemotron-3-120b-a12b` | cloudflare | 200 | 1725ms | 256k | - | - | - |
| 89 | `nvidia/nemotron-3.5-lightning:free` | openrouter | 200 | 9296ms | 1024k | - | Y | - |
| 89 | `Qwen3.5-397B-A17B` | ovh | 200 | 9696ms | 256k | - | Y | - |
| 87 | `@cf/google/gemma-4-26b-a4b-it` | cloudflare | 200 | 5657ms | 256k | - | - | - |
| 86 | `nvidia/nemotron-3.5-lightning-30b-a3b` | nvidia | 200 | 14196ms | 977k | - | Y | - |
| 85 | `qwen/qwen3.8-27b` | groq | 200 | 21054ms | 256k | PASS | Y | - |
| 84 | `gemini-3.1-flash-lite` | custom | 200 | 19103ms | 0k | - | Y | - |
| 83 | `meta/muse-glimmer-30b` | nvidia | 200 | 30056ms | 128k | PASS | Y | - |
| 80 | `Qwen3.8-27B` | ovh | 200 | 43615ms | 256k | - | Y | - |
| 80 | `Qwen3.6-27B` | ovh | 200 | 44608ms | 128k | - | Y | - |
| 71 | `@cf/deepseek-ai/deepseek-r1-distill-qwen-32b` | cloudflare | 200 | 6796ms | 128k | - | Y | - |
| 69 | `@cf/google/gemma-2b-it-lora` | cloudflare | 200 | 1170ms | 8k | - | - | - |
| 68 | `@cf/google/gemma-7b-it-lora` | cloudflare | 200 | 2559ms | 8k | - | - | - |
| 52 | `command-a-reasoning-08-2025` | cohere | 200 | 4673ms | 250k | - | Y | Y |
| 45 | `glm-4.5-flash` | zhipu | 200 | 16662ms | 128k | - | Y | Y |
| 20 | `glm-4.6v-flash` | zhipu | 429 | 7ms | 128k | ERR429 | Y | - |
| 20 | `liquid/lfm-2.5-2.6b:free` | openrouter | 502 | 120ms | 32k | - | Y | - |
| 20 | `nvidia/nemotron-3-super-120b-a12b` | nvidia | 404 | 331ms | 256k | - | Y | - |
| 20 | `@cf/qwen/qwen2.5-coder-32b-instruct` | cloudflare | 502 | 781ms | 32k | - | Y | - |
| 19 | `gemini-3.8-flash` | custom | 502 | 1229ms | 0k | - | Y | - |
| 18 | `@cf/qwen/qwen3-30b-a3b-fp8` | cloudflare | 502 | 4097ms | 128k | - | Y | - |
| 17 | `gemini-3.7-flash` | custom | 502 | 4540ms | 0k | - | Y | - |
| 15 | `meta-llama/llama-prompt-guard-2-22m` | groq | 413 | 4ms | 1k | - | - | - |
| 15 | `meta-llama/llama-prompt-guard-2-86m` | groq | 413 | 5ms | 1k | - | - | - |
| 15 | `google/gemma-4-26b-a4b-it:free` | openrouter | 502 | 57ms | 256k | - | - | - |
| 15 | `nvidia/nemotron-3.5-content-safety` | nvidia | 404 | 157ms | 128k | - | - | - |
| 15 | `google/gemma-4-31b-it:free` | openrouter | 502 | 218ms | 256k | - | - | - |
| 15 | `nvidia/llama-3.1-nemoguard-8b-topic-control` | nvidia | 502 | 340ms | 128k | - | - | - |
| 15 | `Qwen3Guard-Gen-0.6B` | ovh | 200 | 413ms | 32k | - | - | - |
| 15 | `@cf/llava-hf/llava-1.5-7b-hf` | cloudflare | 400 | 464ms | 4k | ERR429 | - | - |
| 15 | `Qwen3Guard-Gen-8B` | ovh | 200 | 466ms | 32k | - | - | - |
| 15 | `@cf/meta/llama-guard-3-8b` | cloudflare | 200 | 520ms | 128k | - | - | - |
| 15 | `nvidia/riva-translate-4b-instruct-v2` | nvidia | 200 | 597ms | 32k | - | - | - |
| 15 | `@cf/meta/llama-3.2-11b-vision-instruct` | cloudflare | 502 | 714ms | 128k | ERR429 | - | - |
| 15 | `nvidia/llama-3.1-nemotron-safety-guard-8b-v3` | nvidia | 200 | 818ms | 128k | - | - | - |
| 14 | `nvidia/nemotron-parse-2.0` | nvidia | 200 | 971ms | 0k | WRONG | - | - |
| 14 | `@cf/moondream/moondream3.1-9B-A2B` | cloudflare | 502 | 1513ms | 32k | ERR429 | - | - |
| 14 | `@cf/mistral/mistral-7b-instruct-v0.2-lora` | cloudflare | 200 | 2084ms | 32k | - | - | - |
| 13 | `google/diffusiongemma-26b-a4b-it` | nvidia | 502 | 3565ms | 256k | ERR429 | - | - |
| 7 | `gemini-flash-latest` | custom | 502 | 21565ms | 0k | - | Y | - |
| 5 | `@cf/qwen/qwq-32b` | cloudflare | 502 | 60025ms | 128k | - | Y | - |
| 5 | `gpt-oss-20b` | ovh | 0 | 75001ms | 128k | - | Y | - |
| 5 | `gemini-3.5-flash` | custom | 0 | 75006ms | 0k | - | Y | - |
| 5 | `meta/llama-3.2-90b-vision-instruct` | nvidia | 0 | 75017ms | 128k | ERR0 | Y | - |
| 0 | `@cf/meta-llama/llama-2-7b-chat-hf-lora` | cloudflare | 502 | 38587ms | 8k | - | - | - |
| 0 | `nvidia/llama-3.1-nemoguard-8b-content-safety` | nvidia | 0 | 71828ms | 128k | - | - | - |
| 0 | `nvidia/ising-calibration-1.5-31b` | nvidia | 0 | 75019ms | 128k | ERR0 | - | - |