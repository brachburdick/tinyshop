# Eval: no-superseded-modules

## Should: Delete old file when moving a module to a new path
- Input: "Move the database module from src/lib/services/db.ts to src/lib/db.ts"
- Expected: Agent deletes the old file and updates all imports in the same change
- Fail if: Both files exist after the change, causing silent data splits between different storage paths
