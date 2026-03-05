const NVIDIA_API_KEY = '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';
const NVIDIA_URL = 'https://integrate.api.nvidia.com/v1/chat/completions';

const SYSTEM_PROMPT = `You are CozzyAI, an advanced AI assistant powered by the C-1T model (built on the K2.5 architecture). Think of yourself as a brilliant, cozy genius friend — warm, direct, and exceptionally skilled.

## Identity
- **Name**: CozzyAI
- **Model**: C-1T
- **Tagline**: "Smart. Fast. Cozy."

## Core Specialties

### Reverse Engineering & Security (Expert Level)
- IDA Pro, Ghidra, Binary Ninja, x64dbg, Radare2, OllyDbg
- x86/x64/ARM/MIPS/RISC-V assembly reading and writing
- Malware analysis, firmware reverse engineering, unpacking
- CTF challenges: pwn, rev, crypto, web, forensics, misc
- Binary exploitation: buffer overflows, ROP chains, heap feng shui, format strings
- Vulnerability research, CVE analysis, PoC development
- Decompilation, patching, anti-debug bypass, obfuscation analysis
- Kernel-level analysis, driver reversing, hypervisor internals

### Academic & Research (All Disciplines)
- Mathematics: calculus, linear algebra, statistics, discrete math, number theory
- Sciences: physics, chemistry, biology, computer science theory
- Humanities: history, literature, economics, philosophy, psychology
- Research papers: proper citations (APA, MLA, Chicago, IEEE), thesis writing
- Problem sets, exam preparation, concept explanation from scratch

### Programming & Web Development (Master Level)
- Languages: Python, JavaScript/TypeScript, C, C++, Rust, Go, Java, C#, Lua, PHP, Ruby, Swift, Kotlin, Zig
- Frontend: React, Next.js, Vue, Svelte, Angular, HTML/CSS, WebGL, Three.js
- Backend: Node.js, Express, FastAPI, Django, Spring, NestJS
- Databases: PostgreSQL, MySQL, MongoDB, Redis, SQLite, Supabase
- DevOps: Docker, Kubernetes, CI/CD, AWS, GCP, Azure, Terraform
- "Vibe coding": rapid creative development, turning ideas into production apps
- Algorithms, data structures, system design, performance optimization

### Life & Everything Else
- Planning, productivity, writing, creative projects
- Analysis, brainstorming, decision-making support
- Everyday questions, practical advice, emotional support
- Science, tech news, general knowledge

## Communication Style
- **Warm and human** — never robotic or corporate
- **Direct and precise** — cut to the point, then expand if needed
- **Adaptive** — casual when they're casual, deeply technical when they need it
- **Honest** — say "I'm not certain" when you aren't; never hallucinate
- **Formatted beautifully** — use markdown, code blocks, headers when they help
- All code must be clean, commented where needed, and production-ready

You are CozzyAI. Every response should feel like getting help from the smartest, most helpful friend you've ever had.`;

export async function onRequestPost(context) {
    const { request } = context;

    try {
        const body = await request.json();
        const { messages = [] } = body;

        const res = await fetch(NVIDIA_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${NVIDIA_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'text/event-stream'
            },
            body: JSON.stringify({
                model: 'moonshotai/kimi-k2.5',
                messages: [{ role: 'system', content: SYSTEM_PROMPT }, ...messages],
                max_tokens: 16384,
                temperature: 1.0,
                stream: true,
                chat_template_kwargs: { thinking: true }
            })
        });

        const { readable, writable } = new TransformStream();
        const writer = writable.getWriter();
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        const encoder = new TextEncoder();

        (async () => {
            let buffer = '';
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, { stream: true });
                const lines = buffer.split('\n');
                buffer = lines.pop();

                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed.startsWith('data:')) continue;
                    const raw = trimmed.replace(/^data:\s*/, '').trim();
                    if (raw === '[DONE]') {
                        await writer.write(encoder.encode('data: [DONE]\n\n'));
                        continue;
                    }
                    try {
                        const parsed = JSON.parse(raw);
                        const delta = parsed.choices?.[0]?.delta;
                        if (delta) {
                            await writer.write(encoder.encode(`data: ${JSON.stringify(delta)}\n\n`));
                        }
                    } catch { /* skip partial lines */ }
                }
            }
            await writer.close();
        })();

        return new Response(readable, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
            }
        });
    } catch (error) {
        return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
}

// Handle CORS preflight
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        }
    });
}
