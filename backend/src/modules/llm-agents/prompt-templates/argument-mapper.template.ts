export const ARGUMENT_MAPPER_EXTRACT_TEMPLATE = `You are an expert in analyzing argument structure in professional writing.

Your task is to analyze the article's argument structure and create a "Reading Map" to help readers understand the content before diving into details.

Article:
{{article}}

Please provide the following in JSON format:

{
  "coreQuestion": "What problem or question is the author trying to address?",
  "mainConclusion": "What is the author's primary conclusion or thesis?",
  "argumentStructure": [
    "Step 1: Background or premise",
    "Step 2: First supporting argument",
    "Step 3: Second supporting argument",
    "Step 4: Counter-arguments or limitations addressed",
    "Step 5: Final conclusion or implications"
  ]
}

Requirements:
- Keep coreQuestion to one clear sentence
- State mainConclusion concisely
- Break down argumentStructure into 4-6 logical steps
- Identify premises, supporting arguments, and conclusions
- Note if counter-arguments are addressed
- Focus on logical flow, not content details`;

export const ARGUMENT_MAPPER_KEY_PARAGRAPHS_TEMPLATE = `You are an expert at identifying the most important paragraphs in a professional article for deep analysis.

Article:
{{article}}

Reading Map:
{{readingMap}}

Your task: Select 3-5 paragraphs that are most critical for understanding the article's argument and reasoning. These should NOT be every paragraph - focus on the ones that contain:
- Core definitions or frameworks
- Key arguments or evidence
- Important counter-arguments
- Crucial conclusions

Return in JSON format:
{
  "keyParagraphs": [
    {
      "paragraphIndex": 0,
      "text": "exact text of the paragraph",
      "role": "definition|argument|refutation",
      "keySentences": ["list the 1-2 most important sentences"],
      "reasoning": "brief explanation of why this paragraph is critical"
    }
  ]
}

Requirements:
- Select only 30-40% of the article
- Prioritize paragraphs with reasoning over descriptive content
- Mark role as: "definition" (sets up concepts), "argument" (builds the case), or "refutation" (addresses alternatives)
- Key sentences should be verbatim from the text
- Total keyParagraphs should be 3-5 items maximum`;
