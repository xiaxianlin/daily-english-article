# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **professional English reading application** for early-career professionals (0-5 years experience) who need to understand professional English content in finance, economics, sociology, and technology. The project is currently in the **planning/documentation phase**.

**Core Value Proposition**: Help users truly understand professional English articles they would normally give up on, and extract reusable professional expressions.

**Target Audience**: A2-B2 English level professionals who need to read domain-specific content but struggle with reasoning-focused language.

## Project Status

**Current Phase**: Documentation and planning. No codebase implementation yet.
- Comprehensive PRD exists in `/docs/PRD.md`
- Technical architecture planned but not implemented
- MVP scope clearly defined

## Planned Architecture

### 4-Layer Design
```
Client (Web/App) → API Layer (FastAPI) → Business Service Layer → LLM Agent Layer → Database/Vector DB
```

### Technology Stack (Planned)

**Backend**:
- Runtime: Node.js (LTS)
- Framework: NestJS or Express
- Language: TypeScript
- Database: MongoDB with Mongoose ODM

**Frontend**:
- Framework: Flutter (iOS/Android primary, Web optional)

**AI/LLM Layer**:
- Separate AI Service (Node.js)
- Agent-based architecture with specialized agents

**Infrastructure**:
- Docker deployment
- Object storage for content
- JWT authentication

## Core Product Flow (Daily Reading Session)

The entire daily session is designed for 10-15 minutes:

1. **Today's Article** - Professional article (300-600 words)
2. **Reading Map** - Background context + argument structure overview
3. **Key Paragraph Analysis** - Deep dive into 3-5 critical paragraphs (not the entire article)
4. **Language Breakdown** - Focus on reasoning expressions (connectors, logical markers)
5. **Understanding Check** - Open-ended questions (not multiple choice)
6. **Professional Output** - User replicates professional writing with AI feedback
7. **Daily Summary** - 3 key takeaways (sentence pattern, concept, expression)

## LLM Agent Architecture

The system uses **specialized agents** rather than monolithic prompts:

1. **Domain Curator Agent** - Selects and curates appropriate professional articles
2. **Argument Mapper Agent** - Extracts argument structure and creates reading maps
3. **Language-for-Reasoning Agent** - Identifies and explains reasoning-focused language
4. **Professional Feedback Agent** - Evaluates user professional output and provides suggestive feedback

Key principle: Each agent has a specific purpose and expertise area.

## Content Design Principles

1. **Selective Analysis**: Only 30-40% of the article gets deep analysis (key paragraphs)
2. **Context-First**: Reading map provides cognitive framework before language details
3. **Output-Focused**: Professional replication over free-form creation
4. **Reasoning Language**: Focus on expressions that aid professional thinking (connectors, logical markers, stance indicators)
5. **Time-Constrained**: All content must fit within 10-15 minute session

## MVP Scope

**Includes**:
- Single domain (e.g., AI/macro-economics)
- Daily 1 article delivery
- Reading map + key paragraph analysis
- 1 professional output exercise with AI feedback
- Basic user tracking

**Excludes** (post-MVP):
- Social features
- Gamification
- Multi-domain switching
- Complex subscriptions
- Spaced repetition system

## Key Differentiators from Language Apps

1. **Professional Focus**: Domain-specific content (finance, economics, sociology, technology)
2. **Reasoning Over Vocabulary**: Emphasis on logical structure and argumentation
3. **Output-Driven**: Professional replication exercises, not just comprehension
4. **Selective Depth**: Quality over quantity - deep analysis of key parts only
5. **Expression Memory System**: Track and review reusable professional expressions

## Development Guidelines (When Implementation Begins)

### Content Curation Standards
- Must be argument-driven professional content (not news, not general interest)
- 300-600 words optimal
- Clear reasoning structure (claims, evidence, connectors)
- Domain-appropriate for target users

### AI Feedback Design
- **Suggestive, not prescriptive**: Offer improvements, don't enforce rules
- **Professional tone**: Mirror workplace communication standards
- **Specific examples**: Show better alternatives with explanations

### Performance Considerations
- Entire session must complete in 10-15 minutes
- LLM calls should be optimized for speed
- Content pre-processing where possible
- Caching for repeated article access

### Data Models (Planned)
- Users (profile, progress, preferences)
- Articles (content, domain, metadata)
- ReadingSessions (user progress, timestamps)
- KeyParagraphs (article structure, analysis)
- ProfessionalExpressions (extracted phrases, user memory)
- FeedbackHistory (user outputs, AI responses)

## Documentation Structure

- `/docs/PRD.md` - Comprehensive product requirements document
- `/docs/technical-design.md` - Technical architecture specifications
- `/docs/mvp-scope.md` - MVP feature definitions and exclusions

## Important Constraints

1. **Time Budget**: Every feature must fit within the 10-15 minute daily session constraint
2. **Cognitive Load**: Avoid overwhelming users - progressive disclosure of complexity
3. **Professional Relevance**: All content must map to real workplace scenarios
4. **Language Level**: Maintain accessibility for A2-B2 learners while preserving professional authenticity
