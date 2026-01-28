# Kanban Board - Team Project

A full-stack Kanban board application built with Angular 17 and NestJS.

## Project Structure

```
kanban-team/
├── backend/                    # NestJS backend (skeleton)
├── frontend/                   # Angular frontend (skeleton)
├── friend1/                    # Friend 1: Authentication & User
├── friend2/                    # Friend 2: Board module
├── friend3/                    # Friend 3: Swimlane & Card modules
├── friend4/                    # Friend 4: Frontend Core + Login/Register
├── friend5/                    # Friend 5: Boards UI feature
└── README.md
```

## Team Assignment

| Person | Responsibility | Folder |
|--------|---------------|--------|
| **You** | Project setup & skeleton | `backend/`, `frontend/` |
| **Friend 1** | Authentication & User management | `friend1/` |
| **Friend 2** | Board module | `friend2/` |
| **Friend 3** | Swimlane & Card modules | `friend3/` |
| **Friend 4** | Frontend core + Login/Register | `friend4/` |
| **Friend 5** | Kanban boards UI feature | `friend5/` |

## Commit Order

1. **Initial commit** (You): "Initial project structure - Kanban Board"
2. **Friend 1**: "Add authentication and user management"
3. **Friend 2**: "Add board management module"
4. **Friend 3**: "Add swimlane and card management"
5. **Friend 4**: "Add frontend core, authentication pages, and routing"
6. **Friend 5**: "Add kanban boards feature with drag-and-drop"

## How to Use

### For You (Initial Setup)
1. Commit the skeleton structure first:
```bash
git add backend/ frontend/ .gitignore README.md
git commit -m "Initial project structure - Kanban Board"
```

### For Friends
Each friend folder contains:
- `backend-code/` or `frontend-code/` - Code to copy
- `README.md` - Step-by-step instructions

Follow the README in your assigned folder to:
1. Copy your files to the project
2. Make any necessary updates
3. Commit your changes

## Tech Stack

### Backend
- NestJS 10
- TypeORM with SQLite
- JWT Authentication
- bcrypt for password hashing

### Frontend
- Angular 17 (standalone components)
- Angular Material
- RxJS
- JWT token management

## Running the Application

### Backend
```bash
cd backend
npm install
npm run start:dev
```
Server runs on http://localhost:3000

### Frontend
```bash
cd frontend
npm install
npm start
```
App runs on http://localhost:4200

## Features
- User registration and login
- JWT-based authentication
- Create/edit/delete boards
- Add swimlanes (columns) to boards
- Add cards (tasks) to swimlanes
- Drag-and-drop cards between swimlanes
- Drag-and-drop to reorder swimlanes
