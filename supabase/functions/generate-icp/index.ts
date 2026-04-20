// Generate an ICP draft for a company using Lovable AI, and optionally
// compute a match score between the AI draft and an existing saved ICP.
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
      "Build a complete Ideal Customer Profile draft for a B2B company, aligned with the 'Building Your ICP' framework (Layer 1 company-level, Layer 2 contact-level, pain/triggers/goals, exclusions, validation).",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        description: { type: "string" },
        tier: {
          type: "string",
          enum: [
            "Tier 1: Dream ICPs",
            "Tier 2: Mid ICPs",
            "Tier 3: Test ICPs",
          ],
        },
        personalization_level: {
          type: "string",
          enum: [
            "Sniper (highly personalized)",
            "Balanced",
            "Shotgun (automated)",
          ],
        },
        // Layer 1
        industry: { type: "string" },
        company_size: { type: "string" },
        geography: { type: "string" },
        funding_stage: { type: "string" },
        hiring_activity: { type: "string" },
        tech_stack: { type: "string" },
        growth_signals: { type: "string" },
        // Layer 2
        job_titles: { type: "array", items: { type: "string" } },
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
        exclusions: { type: "string" },
        disqualifiers: { type: "string" },
        // Validation
        tam_estimate: { type: "string" },
        validation_notes: { type: "string" },
        notes: { type: "string" },
      },
      required: [
        "name",
        "description",
        "tier",
        "industry",
        "company_size",
        "geography",
        "job_titles",
        "pain_points",
        "buying_triggers",
        "goals",
      ],
      additionalProperties: false,
    },
  },
};

const SCORED_FIELDS = [
  "industry",
  "company_size",
  "geography",
  "funding_stage",
  "hiring_activity",
  "tech_stack",
  "growth_signals",
  "departments",
  "seniority",
  "buying_role",
  "pain_points",
  "buying_triggers",
  "decision_process",
  "goals",
  "budget_range",
  "exclusions",
  "disqualifiers",
  "tam_estimate",
] as const;

function tokenize(s: any): Set<string> {
  if (s == null) return new Set();
  const text = Array.isArray(s) ? s.join(" ") : String(s);
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2),
  );
}

function jaccard(a: Set<string>, b: Set<string>): number {
  if (a.size === 0 && b.size === 0) return 1;
  if (a.size === 0 || b.size === 0) return 0;
  let inter = 0;
  for (const v of a) if (b.has(v)) inter++;
  const uni = a.size + b.size - inter;
  return inter / uni;
}

function scoreMatch(ai: any, real: any) {
  const fieldScores: Record<string, number> = {};
  let total = 0;
  let count = 0;
  for (const k of SCORED_FIELDS) {
    const aTok = tokenize(ai?.[k]);
    const rTok = tokenize(real?.[k]);
    if (aTok.size === 0 && rTok.size === 0) continue;
    const s = jaccard(aTok, rTok);
    fieldScores[k] = Math.round(s * 100);
    total += s;
    count++;
  }
  // Job titles compared as sets too
  const aJobs = new Set(
    (ai?.job_titles ?? []).map((j: string) => j.toLowerCase().trim()),
  );
  const rJobs = new Set(
    (real?.job_titles ?? []).map((j: string) => j.toLowerCase().trim()),
  );
  if (aJobs.size > 0 || rJobs.size > 0) {
    const s = jaccard(aJobs, rJobs);
    fieldScores["job_titles"] = Math.round(s * 100);
    total += s;
    count++;
  }
  const overall = count === 0 ? 0 : Math.round((total / count) * 100);
  return { overall, fields: fieldScores };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const body = await req.json();
    const company = body.company ?? {};
    const hint = body.hint ?? "";
    const compareTo = body.compareTo ?? null;

    const systemPrompt = `You are a senior B2B GTM strategist building Ideal Customer Profiles (ICPs) for outbound sales.
Follow the "Building Your ICP" framework:
- Layer 1: Company-level (industry, size, geography, funding, hiring, tech stack, growth signals).
- Layer 2: Contact-level (decision-maker job titles, departments, seniority, buying role).
- Pain Points, Buying Triggers, Goals, Decision Process, Budget.
- Exclusions and red-flag Disqualifiers.
- Validation: estimated TAM and validation notes.

Be concrete, specific, and avoid generic fluff. Use realistic numbers and named tools when relevant.`;

    const userPrompt = `Generate a complete ICP draft for this company:

Company name: ${company.name ?? "Unknown"}
Slug: ${company.slug ?? ""}
${company.customDomain ? `Domain: ${company.customDomain}` : ""}
${hint ? `Extra context from admin: ${hint}` : ""}

Output via the build_icp tool. Make sure every required field is filled with specific, useful content tailored to this company's likely market.`;

    const aiRes = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          tools: [ICP_TOOL],
          tool_choice: {
            type: "function",
            function: { name: "build_icp" },
          },
        }),
      },
    );

    if (!aiRes.ok) {
      const t = await aiRes.text();
      console.error("AI gateway error", aiRes.status, t);
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit reached, try again shortly." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({
            error: "AI credits exhausted. Add funds in Settings → Workspace → Usage.",
          }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await aiRes.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) {
      return new Response(
        JSON.stringify({ error: "AI did not return structured ICP" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const draft = JSON.parse(toolCall.function.arguments);

    let score = null;
    if (compareTo) {
      score = scoreMatch(draft, compareTo);
    }

    return new Response(JSON.stringify({ draft, score }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-icp error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
