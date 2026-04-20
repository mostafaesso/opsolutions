// Generate an ICP draft for a company using Lovable AI, grounded in the
// company's website content and aligned with the LinkedIn/Apollo ICP framework.
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const ICP_TOOL = {
  type: "function",
  function: {
    name: "build_icp",
    description:
      "Build a complete, LinkedIn/Apollo-ready Ideal Customer Profile for a B2B company.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string", description: "Concise ICP summary: target companies and why they fit." },
        tier: {
          type: "string",
          enum: ["Tier 1: Dream ICPs", "Tier 2: Mid ICPs", "Tier 3: Test ICPs"],
        },
        personalization_level: {
          type: "string",
          enum: ["Sniper (highly personalized)", "Balanced", "Shotgun (automated)"],
        },
        // Layer 1 — company filters
        industry: { type: "string", description: "Industry keywords for LinkedIn/Apollo company filter." },
        company_size: { type: "string", description: "Employee count and/or revenue ranges." },
        geography: { type: "string", description: "HQ locations / regions." },
        funding_stage: { type: "string" },
        hiring_activity: { type: "string" },
        tech_stack: { type: "string", description: "Technologies installed (Apollo tech filter)." },
        growth_signals: { type: "string" },
        // Layer 2 — people filters
        job_titles: { type: "array", items: { type: "string" }, description: "Decision-maker titles for LinkedIn/Apollo people filter." },
        departments: { type: "string" },
        seniority: { type: "string" },
        buying_role: { type: "string" },
        // Strategy
        pain_points: { type: "string" },
        buying_triggers: { type: "string" },
        decision_process: { type: "string" },
        goals: { type: "string" },
        budget_range: { type: "string" },
        // Exclusions
        exclusions: { type: "string", description: "Industries / company types to exclude." },
        disqualifiers: { type: "string", description: "Titles or signals to avoid." },
        // Validation
        tam_estimate: { type: "string" },
        validation_notes: { type: "string" },
        notes: {
          type: "string",
          description:
            "Markdown block with: Buyer Personas (table), LinkedIn Sales Nav Boolean string, Apollo Boolean string, exclusion Boolean string. Copy-paste ready.",
        },
      },
      required: [
        "name",
        "description",
        "tier",
        "industry",
        "company_size",
        "geography",
        "job_titles",
        "departments",
        "seniority",
        "pain_points",
        "buying_triggers",
        "goals",
        "exclusions",
        "notes",
      ],
      additionalProperties: false,
    },
  },
};

const SCORED_FIELDS = [
  "industry","company_size","geography","funding_stage","hiring_activity",
  "tech_stack","growth_signals","departments","seniority","buying_role",
  "pain_points","buying_triggers","decision_process","goals","budget_range",
  "exclusions","disqualifiers","tam_estimate",
] as const;

function tokenize(s: any): Set<string> {
  if (s == null) return new Set();
  const text = Array.isArray(s) ? s.join(" ") : String(s);
  return new Set(
    text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter((w) => w.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const v of a) if (b.has(v)) inter++;
  return inter / (a.size + b.size - inter);
}

function scoreMatch(ai: any, real: any) {
  const fieldScores: Record<string, number> = {};
  let total = 0, count = 0;
  for (const k of SCORED_FIELDS) {
    const aTok = tokenize(ai?.[k]);
    const rTok = tokenize(real?.[k]);
    if (aTok.size === 0 && rTok.size === 0) continue;
    const s = jaccard(aTok, rTok);
    fieldScores[k] = Math.round(s * 100);
    total += s; count++;
  }
  const aJobs = new Set((ai?.job_titles ?? []).map((j: string) => j.toLowerCase().trim()));
  const rJobs = new Set((real?.job_titles ?? []).map((j: string) => j.toLowerCase().trim()));
  if (aJobs.size > 0 || rJobs.size > 0) {
    const s = jaccard(aJobs, rJobs);
    fieldScores["job_titles"] = Math.round(s * 100);
    total += s; count++;
  }
  const overall = count === 0 ? 0 : Math.round((total / count) * 100);
  return { overall, fields: fieldScores };
}

// Strip HTML to readable text
function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(input: string): string | null {
  if (!input) return null;
  let u = input.trim();
  if (!/^https?:\/\//i.test(u)) u = "https://" + u;
  try { return new URL(u).toString(); } catch { return null; }
}

async function fetchSiteContext(domain: string): Promise<string> {
  const base = normalizeUrl(domain);
  if (!base) return "";
  const candidates = [base, base.replace(/\/?$/, "/about"), base.replace(/\/?$/, "/pricing"), base.replace(/\/?$/, "/customers")];
  const out: string[] = [];
  for (const url of candidates) {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 6000);
      const r = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (compatible; OpsSolutions-ICP-Bot/1.0)" },
        signal: ctrl.signal,
      });
      clearTimeout(t);
      if (!r.ok) continue;
      const html = await r.text();
      const text = htmlToText(html).slice(0, 4000);
      if (text) out.push(`--- ${url} ---\n${text}`);
    } catch (e) {
      console.warn("fetchSiteContext failed for", url, String(e));
    }
    if (out.join("\n").length > 10000) break;
  }
  return out.join("\n\n").slice(0, 12000);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const company = body.company ?? {};
    const hint = body.hint ?? "";
    const compareTo = body.compareTo ?? null;

    if (!company.customDomain) {
      return new Response(
        JSON.stringify({ error: "Company domain is required to generate an accurate ICP. Add it in the company info above." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    console.log("Fetching site context for", company.customDomain);
    const siteContext = await fetchSiteContext(company.customDomain);
    console.log("Site context length:", siteContext.length);

    const systemPrompt = `You are a senior B2B GTM strategist building Ideal Customer Profiles (ICPs) for outbound lead generation on LinkedIn Sales Navigator and Apollo.

Build a clear, data-driven ICP that translates DIRECTLY into search filters for those platforms.

Required deliverables (return via the build_icp tool):
1. ICP Summary — concise description of target companies and why they fit (use 'description').
2. Buyer Personas — decision-makers, titles, pain points, motivations (put in 'notes' as a markdown table).
3. Search Filters — fill the company-level fields (industry, company_size, geography, funding_stage, tech_stack, etc.) and people-level fields (job_titles, departments, seniority, buying_role) so they can be pasted into LinkedIn/Apollo filters.
4. Exclusion Filters — fill 'exclusions' and 'disqualifiers'.
5. Boolean Search Examples — in 'notes', add three copy-paste-ready boolean strings: one for LinkedIn Sales Navigator (titles), one for Apollo (titles), and one for exclusions. Use AND/OR/NOT and quotes.

Be concrete and specific. Ground every claim in the company's actual website content provided below — do NOT invent product features or markets that aren't supported by the site.`;

    const userPrompt = `Company: ${company.name ?? "Unknown"}
Domain: ${company.customDomain}
${hint ? `Extra context from admin: ${hint}\n` : ""}
=== SCRAPED WEBSITE CONTENT (use this as the source of truth for what they sell) ===
${siteContext || "(site could not be fetched — make a best-effort ICP from the domain name and hint, and note this limitation in validation_notes)"}
=== END WEBSITE CONTENT ===

Now build the complete ICP via the build_icp tool. Make every field copy-paste-ready for LinkedIn Sales Navigator / Apollo.`;

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [ICP_TOOL],
        tool_choice: { type: "function", function: { name: "build_icp" } },
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings → Workspace → Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(JSON.stringify({ error: "AI did not return structured ICP" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const draft = JSON.parse(toolCall.function.arguments);
    const score = compareTo ? scoreMatch(draft, compareTo) : null;
    const siteFetched = siteContext.length > 0;

    return new Response(JSON.stringify({ draft, score, siteFetched }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-icp error", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
