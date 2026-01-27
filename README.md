# Tanstack Reddit Clone

This project is simplified clone of reddit which is a multiforum website containing only the minimum amount of features.

## Tech-Stack

Tanstack-start, Tanstack-Query, React.js, TypeScript, Better-auth, Lucide-Icon, Drizzle, Postgres..

## Features

- Community Creation Where The Creator Would Be Asigned As an Admin By default.
- Join Communities
- Post Creation.
- Post Comments.
- Liking and Disliking Posts with Optimistic Updates.

## Set Up

Requirements: **Node.js 22+**, **Docker** and **Docker Compose**

Create `.env` files with `DATABASE_URL` and `BETTER_AUTH_SECRET` for your database url and better auth authentication secret respectively.
generate [better-auth](https://www.better-auth.com/docs/installation)
example:

```
DATABASE_URL="postgresql://myuser:mypassword@localhost:5432/mydatabase"
BETTER_AUTH_SECRET="EtuuuuhruW8D03ZpHrf4AKdBHpnIIw5q"
```

If you want to run Postgres locally, you need to run:

```bash
docker compose up
```
Install npm packages

```
npm install
```
Once the DB is up and running and npm packages are installed.

```
npm run db:migrate
```
to build and run the project
```
npm run build
npm run serve
```
To run in development mode
```
npm run dev
```
