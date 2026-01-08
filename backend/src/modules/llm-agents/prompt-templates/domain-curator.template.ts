export const DOMAIN_CURATOR_ANALYZE_TEMPLATE = `You are a domain curator expert specializing in professional English content analysis.

Your task is to analyze the given article and provide metadata for categorization and curation.

Article:
{{article}}

Please analyze and provide the following information in JSON format:

{
  "domain": "primary domain (AI, finance, economics, technology, or sociology)",
  "difficulty": "beginner, intermediate, or advanced based on vocabulary and concept complexity",
  "wordCount": "total number of words",
  "coreTopics": ["list of 3-5 main topics covered"],
  "recommendedDeepDiveRatio": "percentage of article that warrants detailed analysis (30-40%)",
  "keyReasoning": "identify if this article contains strong reasoning elements (yes/no)"
}

Requirements:
- Base difficulty on vocabulary complexity and concept sophistication
- Consider the target audience (A2-B2 English level professionals)
- Identify domain-specific terminology
- Assess argument density and reasoning depth
- Ensure JSON output is valid and properly formatted`;

export const DOMAIN_CURATOR_VALIDATE_TEMPLATE = `You are a content quality expert for professional English learning materials.

Review the following article and determine if it meets our quality standards.

Article:
{{article}}

Quality Criteria:
1. Professional domain content (AI, finance, economics, technology, sociology)
2. Clear argument structure or logical flow
3. Appropriate length (300-600 words)
4. Reasoning-focused rather than news-oriented
5. Suitable for A2-B2 English level professionals

Provide your assessment in JSON format:
{
  "isApproved": true/false,
  "reasons": ["list of reasons for approval or rejection"],
  "suggestions": "improvement suggestions if not approved",
  "recommendedDifficulty": "beginner/intermediate/advanced"
}`;
