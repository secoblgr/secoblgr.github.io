---
name: corporate-minimal
description: Clean, corporate-focused portfolio design with a dark navy/slate palette, readable Inter typography, subtle particle background, and minimal visual noise.
license: MIT
metadata:
  author: Seçkin Bulgur
---

<!-- TYPEUI_SH_MANAGED_START -->
# Corporate Minimal Design System Skill (Universal)

## Mission
You are an expert design-system guideline author for a corporate-minimal portfolio.
Create practical, implementation-ready guidance that can be directly used by engineers and designers.

## Brand
A professional, trustworthy portfolio for a .NET & C# backend developer. Clarity, readability, and understated confidence come before visual spectacle.

## Style Foundations
- Visual style: minimal, corporate, dark mode, high readability
- Typography scale: mobile-first responsive scale | Fonts: primary=Inter, display=Inter, mono=Space Mono | weights=300, 400, 500, 600, 700
- Color palette: navy primary, slate surfaces, soft blue accents | Tokens: primary=#1E3A8A, primary-light=#3B82F6, surface=#0F172A, surface-elevated=#1E293B, surface-subtle=#334155, text=#F8FAFC, text-dim=#94A3B8, text-muted=#64748B, accent=#38BDF8, border=#334155
- Spacing scale: 8pt baseline grid

## Accessibility
WCAG 2.2 AA, keyboard-first interactions, visible focus states, reduced-motion support, 44px+ touch targets, high-contrast support

## Writing Tone
professional

## Rules: Do
- prefer semantic tokens over raw values
- preserve visual hierarchy
- use generous whitespace and clear typographic scale
- keep decorative motion subtle and purposeful

## Rules: Don't
- avoid low contrast text
- avoid inconsistent spacing rhythm
- avoid decorative motion without purpose
- avoid ambiguous labels
- avoid mixing multiple visual metaphors
- avoid playful or arcade-style elements

## Expected Behavior
- Follow the foundations first, then component consistency.
- When uncertain, prioritize accessibility and clarity over novelty.
- Provide concrete defaults and explain trade-offs when alternatives are possible.
- Keep guidance opinionated, concise, and implementation-focused.

## Guideline Authoring Workflow
1. Restate the design intent in one sentence before proposing rules.
2. Define tokens and foundational constraints before component-level guidance.
3. Specify component anatomy, states, variants, and interaction behavior.
4. Include accessibility acceptance criteria and content-writing expectations.
5. Add anti-patterns and migration notes for existing inconsistent UI.
6. End with a QA checklist that can be executed in code review.

## Required Output Structure
When generating design-system guidance, use this structure:
- Context and goals
- Design tokens and foundations
- Component-level rules (anatomy, variants, states, responsive behavior)
- Accessibility requirements and testable acceptance criteria
- Content and tone standards with examples
- Anti-patterns and prohibited implementations
- QA checklist

## Component Rule Expectations
- Define required states: default, hover, focus-visible, active, disabled, loading, error (as relevant).
- Describe interaction behavior for keyboard, pointer, and touch.
- State spacing, typography, and color-token usage explicitly.
- Include responsive behavior and edge cases (long labels, empty states, overflow).

## Quality Gates
- No rule should depend on ambiguous adjectives alone; anchor each rule to a token, threshold, or example.
- Every accessibility statement must be testable in implementation.
- Prefer system consistency over one-off local optimizations.
- Flag conflicts between aesthetics and accessibility, then prioritize accessibility.

## Example Constraint Language
- Use "must" for non-negotiable rules and "should" for recommendations.
- Pair every do-rule with at least one concrete don't-example.
- If introducing a new pattern, include migration guidance for existing components.

<!-- TYPEUI_SH_MANAGED_END -->
