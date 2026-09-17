# Testing - Phase 7

## Automated (run locally - not run in authoring sandbox)
```
npm ci
npm run typecheck
npm run build
```

## Manual QA checklist
1. Open Games (/games). Three game cards show with Best: 0 on a fresh profile.
2. Letter Bubbles: press Start; letters fall; typing the correct letter pops the lowest matching bubble and adds score.
3. Let 3 bubbles reach the bottom; the game ends and the score is saved.
4. Word Runner: press Start; type the shown word; correct letters turn green, wrong red; finishing a word scores its length and loads a new word.
5. Word Runner ends at 0 seconds; score is saved. (Switch profile language to Hindi to see Hindi words.)
6. Key Defender: press Start; keys approach the base; typing their letter destroys the nearest match.
7. Let 3 keys reach the base; the game ends and the score is saved.
8. Return to the hub; Best and the High scores section reflect your real results.
9. After playing, open Statistics (/statistics); the heatmap/finger data now include keystrokes from games.
10. Reload the app; high scores persist (separate IndexedDB db).
