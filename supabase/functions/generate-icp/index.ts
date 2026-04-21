const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ICP_TOOL = {
  name: "build_icp",
  description: "Build a complete, LinkedIn/Apollo-ready Ideal Customer Profile for a B2B company.",
  input_schema: {
    type: "object",
    properties: {
      name: { type: "string" },
      description: { type: "string", description: "Concise ICP summary: target companies and why they fit." },
      tier: { type: "string", enum: ["Tier 1: Dream ICPs", "Tier 2: Mid ICPs", "Tier 3: Test ICPs"] },
      personalization_level: {
        type: "string",
        enum: ["Sniper (highly personalized)", "Balanced", "Shotgun (automated)"],
      },
      industry: { type: "string", description: "Industry keywords for LinkedIn/Apollo company filter." },
      company_size: { type: "string", description: "Employee count and/or revenue ranges." },
      geography: { type: "string", description: "HQ locations / regions — ONLY from website evidence." },
      funding_stage: { type: "string" },
      hiring_activity: { type: "string" },
      tech_stack: { type: "string", description: "Technologies installed (Apollo tech filter)." },
      growth_signals: { type: "string" },
      job_titles: { type: "array", items: { type: "string" }, description: "Decision-maker titles." },
      departments: { type: "string" },
      seniority: { type: "string" },
      buying_role: { type: "string" },
      pain_points: { type: "string" },
      buying_triggers: { type: "string" },
      decision_process: { type: "string" },
      goals: { type: "string" },
      budget_range: { type: "string" },
      exclusions: { type: "string", description: "Industries / company types to exclude." },
      disqualifiers: { type: "string", description: "Titles or signals to avoid." },
      tam_estimate: { type: "string" },
      validation_notes: { type: "string" },
      notes: {
        type: "string",
        description:
          "Markdown block with: Buyer Personas table, LinkedIn Sales Nav Boolean string, Apollo Boolean string, exclusion Boolean string.",
      },
    },
    required: [
      "name", "description", "tier", "industry", "company_size", "geography",
      "job_titles", "departments", "seniority", "pain_points", "buying_triggers",
      "goals", "exclusions", "notes",
    ],
    additionalProperties: false,
  },
};

const SCORED_FIELDS = [
  "industry", "company_size", "geography", "funding_stage", "hiring_activity",
  "tech_stack", "growth_signals", "departments", "seniority", "buying_role",
  "pain_points", "buying_triggers", "decision_process", "goals", "budget_range",
  "exclusions", "disqualifiers", "tam_estimate",
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

async function fetchOne(url: string): Promise<string> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 6000);
    const r = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; OpsSolutions-ICP-Bot/1.0)" },
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (!r.ok) return "";
    const html = await r.text();
    const text = htmlToText(html).slice(0, 4000);
    return text ? `--- ${url} ---\n${text}` : "";
  } catch (e) {
    console.warn("fetchSiteContext failed for", url, String(e));
    return "";
  }
}

async function fetchSiteContext(domain: string): Promise<string> {
  const base = normalizeUrl(domain);
  if (!base) return "";
  const candidates = [
    base,
    base.replace(/\/?$/, "/about"),
    base.replace(/\/?$/, "/services"),
    base.replace(/\/?$/, "/pricing"),
    base.replace(/\/?$/, "/customers"),
    base.replace(/\/?$/, "/industries"),
  ];
  const results = await Promise.allSettled(candidates.map(fetchOne));
  return results
    .flatMap((r) => (r.status === "fulfilled" && r.value ? [r.value] : []))
    .join("\n\n")
    .slice(0, 14000);
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
    if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY not configured in Supabase secrets");

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

    const siteFetched = siteContext.length > 200;

    const systemPrompt = `You are a senior B2B GTM strategist building Ideal Customer Profiles (ICPs) for outbound lead generation on LinkedIn Sales Navigator and Apollo.

CRITICAL RULES — violating these makes the ICP useless:
1. GEOGRAPHY: Set geography ONLY to regions/countries explicitly mentioned on the website (e.g. "GCC", "Middle East", "MENA", "Saudi Arabia", "UAE"). If the site says GCC, write "GCC". NEVER default to "United States, Canada, UK, Australia" unless the website clearly sells there.
2. INDUSTRY: Use only industries the company explicitly targets — do not invent new verticals.
3. If a field cannot be determined from the website content, write "Requires manual input — not found on site" rather than guessing.
4. Be specific and concrete. Every value must be copy-pasteable into a LinkedIn Sales Navigator or Apollo filter.
5. Ground EVERY claim in the scraped website content below. Do not invent features, markets, or buyer personas not supported by the site.`;

    const userPrompt = `Company: ${company.name ?? "Unknown"}
Domain: ${company.customDomain}
${hint ? `=== ADMIN-PROVIDED CONTEXT (highest priority — treat as ground truth) ===\n${hint}\n=== END ADMIN CONTEXT ===\n` : ""}
${!siteFetched && !hint ? "⚠️ WARNING: Website could not be scraped and no manual context was provided. Make a best-effort ICP from the domain name only and flag all fields as needing review in validation_notes.\n" : ""}
${!siteFetched && hint ? "Note: Website could not be scraped — rely on the admin-provided context above.\n" : ""}
=== SCRAPED WEBSITE CONTENT (use to supplement admin context above) ===
${siteContext || "(site could not be fetched)"}
=== END WEBSITE CONTENT ===

Build the ICP via the build_icp tool. If admin context was provided, it overrides anything from the scraped website. Pay special attention to geography — use EXACTLY the regions mentioned in the context.`;`;

    const aiRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 4096,
        tools: [ICP_TOOL],
        tool_choice: { type: "tool", name: "build_icp" },
        system: systemPrompt,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("Anthropic API error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit reached, try again shortly." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(JSON.stringify({ error: `AI API error: ${aiRes.status}` }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const toolUse = data.content?.find((c: any) => c.type === "tool_use");
    if (!toolUse) {
      console.error("No tool_use in response", JSON.stringify(data));
      return new Response(JSON.stringify({ error: "AI did not return structured ICP" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const draft = toolUse.input;
    const score = compareTo ? scoreMatch(draft, compareTo) : null;

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
