# Feedback Loop

This project is meant to evolve through daily player feedback collected from itch.io comments.

## Daily Routine

1. Read new itch.io comments and group them into:
   - bugs
   - clarity issues
   - balance and difficulty
   - feel and polish
   - feature requests
2. Pick the top `1-3` items that are both high-signal and realistic for one day.
3. Implement one focused update instead of many half-finished ideas.
4. Test the changed behavior quickly in browser.
5. Write a short entry in `CHANGELOG.md`.
6. Update the itch.io page text if the player-facing experience changed.

## Prioritization Rules

Prefer suggestions that:

- remove frustration for many players
- improve clarity in the first 30 seconds
- make the game feel better without increasing complexity too much
- match the core fantasy of the game
- can be shipped and observed quickly

Delay suggestions that:

- require a large rewrite before the game loop is stable
- add systems that players have not actually asked for
- increase scope without improving the current experience

## Comment Triage Template

Use this lightweight format when collecting comments:

```md
## YYYY-MM-DD

- Player quote:
- Source: itch.io comment
- Problem type:
- Proposed action:
- Decision: do now / later / reject
- Notes:
```

## Public Devlog Habit

When possible, keep updates visible and small:

- "Improved early-game readability"
- "Reduced unfair meteor spawns"
- "Added touch drag support"
- "Adjusted orb spawn pacing from player feedback"

This makes players feel heard and gives them a reason to return with more suggestions.
