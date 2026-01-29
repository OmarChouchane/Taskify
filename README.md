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
