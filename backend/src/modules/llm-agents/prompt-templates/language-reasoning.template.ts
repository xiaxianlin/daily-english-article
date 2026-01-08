export const LANGUAGE_REASONING_EXTRACT_TEMPLATE = `You are an expert in teaching professional English for reasoning and argumentation.

Your task: Extract and explain language used for reasoning in the given article segments.

Focus on expressions that help with:
- Making claims and stating positions
- Presenting evidence and support
- Showing logical relationships (cause, effect, contrast)
- Expressing caution and uncertainty
- Signaling transitions in arguments

Key Paragraphs:
{{keyParagraphs}}

Article Context:
{{article}}

Provide analysis in JSON format:
{
  "languageBreakdown": [
    {
      "expression": "exact expression from text",
      "explanation": "how this expression functions in reasoning",
      "transferable": true/false,
      "category": "claim|evidence|causality|contrast|uncertainty|transition",
      "examples": ["1-2 alternative ways to express similar meaning"]
    }
  ]
}

Requirements:
- Focus on reasoning language, not general vocabulary
- Include connectors (however, therefore, furthermore)
- Include stance markers (suggests, indicates, demonstrates)
- Include uncertainty markers (may, might, appears)
- Include causal language (leads to, results in, due to)
- Mark as transferable if useful in other professional contexts
- Prioritize expressions over individual words
- Select 5-8 most important expressions

Do NOT include:
- Basic vocabulary unrelated to reasoning
- Grammatical explanations
- Translation of entire paragraphs`;

export const LANGUAGE_REASONING_CONTEXTUALIZE_TEMPLATE = `You are helping an A2-B2 level English learner understand professional reasoning language.

For each expression, provide:
1. Simple explanation in accessible language
2. When and why professionals use it
3. Common contexts where it appears
4. Common mistakes to avoid

Expressions to explain:
{{expressions}}

Return in JSON format:
{
  "explainedExpressions": [
    {
      "expression": "the expression",
      "simpleExplanation": "explain like you're talking to a colleague",
      "whenToUse": "specific professional contexts",
      "commonMistakes": ["mistake 1", "mistake 2"],
      "collocation": ["word that frequently appear with this expression"]
    }
  ]
}

Keep explanations concise and practical for workplace use.`;
