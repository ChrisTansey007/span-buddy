@echo off
cd /d "C:\Users\theca\Documents\Claude\Projects\Fine Tune OpenCode\span-buddy"
del .auth.bat 2>nul
del .auth.log 2>nul
echo --- GIT INIT --- > .setup.log
git init -b main >> .setup.log 2>&1
echo --- GIT ADD --- >> .setup.log
git add . >> .setup.log 2>&1
echo --- STATUS --- >> .setup.log
git status --short >> .setup.log 2>&1
echo --- CONFIG USER --- >> .setup.log
git config user.email "thecarpenter73@yahoo.com" >> .setup.log 2>&1
git config user.name "Chris Tansey" >> .setup.log 2>&1
echo --- COMMIT --- >> .setup.log
git commit -m "chore: initial project plan docs" -m "Span Buddy: residential beam & floor joist calculator, IRC 2021 prescriptive. Director-led OpenCode team; humans own IRC table porting + scope calls. Ship path: Phase 0 foundation -> Phase 1 engine -> Phase 2 UX -> Phase 3 PE review pack -> Phase 4 DXF -> Phase 5 NDS engineered." -m "Includes: PROJECT_PLAN.md, TEAM.md (prompt templates w/ 2026-04 fixes), PHASE_0_CHECKLIST.md, README stub." >> .setup.log 2>&1
echo --- CREATE REPO --- >> .setup.log
gh repo create ChrisTansey007/span-buddy --public --source=. --remote=origin --description "Residential beam & floor joist calculator (IRC 2021). Director-led OpenCode team." --push >> .setup.log 2>&1
echo --- DONE --- >> .setup.log
