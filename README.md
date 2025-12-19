Aura Music Player - DevOps Project

Introduction

Aura is an AI-enhanced music player designed to demonstrate modern DevOps practices and version control workflows. It features local playback, Google Drive synchronization, and Gemini AI integration for song insights and transitions.

Project Structure

src/: Contains source code (HTML, CSS, JS).

pom.xml: Maven configuration for project management.

README.md: Project documentation.

DevOps & Git Workflow

This project follows strict version control guidelines:

Maven Implementation: Used for managing the project lifecycle.

Branching Strategy:

main: Production-ready code.

feature: New functionality development.

test: UI and logic verification.

bugfix: Issue resolution.

experiment: Prototype features.

Merge Conflict Resolution: Demonstrated a conflict in index.html between main and bugfix branches and resolved it manually.

Git Commands Used

git init
git add .
git commit -m "message"
git branch <branch_name>
git checkout <branch_name>
git merge <branch_name>
git remote add origin <url>
git push -u origin main


Challenges & Conclusion

Challenge: Managing cross-branch conflicts during parallel development.

Resolution: Utilized Git's conflict markers to merge code manually while maintaining UI integrity.

Outcome: Successfully implemented a version-controlled music application with a clear commit history.
