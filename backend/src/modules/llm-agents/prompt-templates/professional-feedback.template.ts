export const PROFESSIONAL_FEEDBACK_EVALUATE_TEMPLATE = `You are an expert in professional communication providing constructive feedback on written output.

Your task: Evaluate the user's professional output and provide helpful, suggestive feedback.

Original Article Context:
{{article}}

Reading Map:
{{readingMap}}

Output Prompt:
{{prompt}}

User's Output:
{{userOutput}}

Provide feedback in JSON format:
{
  "feedback": {
    "logicScore": 1-5,
    "toneScore": 1-5,
    "clarityScore": 1-5,
    "strengths": ["specific things done well"],
    "logicFeedback": "feedback on reasoning and logical structure",
    "toneFeedback": "feedback on professional tone and appropriateness",
    "suggestions": [
      {
        "original": "problematic phrase or section",
        "improvement": "suggested better alternative",
        "reason": "why this improvement is better"
      }
    ],
    "overallAssessment": "summary of performance with encouragement"
  }
}

Scoring Criteria:
- Logic Score (1-5): clarity of reasoning, logical flow, use of evidence
- Tone Score (1-5): professional appropriateness, confidence level
- Clarity Score (1-5): how easily understood the message is

Requirements:
- Be supportive and constructive, not critical
- Focus on 2-3 specific improvements, not everything
- Explain WHY suggestions are improvements
- Acknowledge what was done well
- Consider the learner's A2-B2 level
- Provide realistic, achievable improvements
- Avoid overwhelming with too much feedback

Output should be:
- Encouraging but honest
- Specific and actionable
- Professional in tone
- Focused on high-impact improvements`;

export const PROFESSIONAL_FEEDBACK_GENERATE_QUESTIONS_TEMPLATE = `You are creating questions to test understanding of a professional article.

Article:
{{article}}

Reading Map:
{{readingMap}}

Generate 2-3 open-ended questions that check:
1. Understanding of the core argument
2. Grasp of key evidence or reasoning
3. Ability to apply concepts (not just recall facts)

Return in JSON format:
{
  "questions": [
    {
      "question": "thoughtful open-ended question",
      "purpose": "what this question checks",
      "sampleAnswer": "model response demonstrating good understanding"
    }
  ]
}

Requirements:
- Questions should be open-ended (not multiple choice)
- Require reasoning, not just memory
- Allow for multiple valid answers
- Test understanding, not vocabulary
- Realistic for A2-B2 level to attempt
- Sample answers should be thorough but concise
- Questions should take 2-3 minutes to answer`;
