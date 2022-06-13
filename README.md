# oaks-back-assignment
Oak's Lab backend assignment 

# Table of Contents
1. [Requirements](#requirements)
2. [How to run](#how-to-run)
3. [Database Structure](#database-structure)
4. [Commands](#commands)
5. [Migrations](#migrations)
6. [Env vars](#env-vars)
7. [Rest endpoints](#rest-endpoints)
8. [Current Improvements](#current-improvements)
9. [Future Improvements](#future-improvements)


## Requirements
- Every phase can have an unlimited amount of tasks
- If the startup accomplishes all tasks in the phase, it’s marked as done and unlocks the next phase.
- Tasks cannot be marked as completed unless all tasks in the previous phase were completed.

## How to run
For the first time, npm install is needed
```$xslt
$ npm install
```

As running database is needed it can be launched through docker compose
```$xslt
$ docker-compose up
```

For the first time, execute migrations is needed
```$xslt
$ DATABASE_URL=postgres://owner:owner@localhost:5432/oaks npm run migrate up
```

Run the server
```$xslt
$ export SERVER_PORT=8082 LOG_LEVEL=info
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=oaks
export DB_USERNAME=owner
export DB_PASSWORD=owner
npm run start
```

## Database Structure
Phases
- id (uuid)
- name (string unique)
- done (boolean default false)
- created_on (date without timezone default now())
- updated_on (date without timezone default now())

Tasks
- id (uuid)
- phase_id (uuid (fk phases.id))
- name (string)
- done (boolean default false)
- created_on (date without timezone default now())
- updated_on (date without timezone default now())


## Commands

- npm run build -> Create the build
- npm run start -> Create the build and starts the server (necessary specify env vars)
- npm run local -> Launch the server locally including nodemon watcher (takes dev vars)
- npm run test -> Run the unit tests
- npm run integration-test -> Run the integration tests
- npm run all-test -> Run all tests
- npm run test:coverage -> Run all tests and calculate coverage


## Migrations
[more info](https://salsita.github.io/node-pg-migrate/#/)

### Create
```$xslt
$ npm run migrate create your migration name
```

### Migrate
```$xslt
$ DATABASE_URL=postgres://owner:owner@localhost:5432/oaks npm run migrate up
```

### Rollback
```$xslt
$ DATABASE_URL=postgres://owner:owner@localhost:5432/oaks npm run migrate down
```

## Env vars

Required env vars before launch the service (if no default value present)

NAME:type(default)

- SERVER_PORT: number(8080)
- LOG_LEVEL: {debug, info, warn, error}(warn)
- SENTRY_DSN: string(''')
- SENTRY_ENVIRONMENT: string(''')
- SENTRY_RELEASE: string(''')
- DB_HOST: string
- DB_PORT: string
- DB_NAME: string
- DB_USERNAME: string
- DB_PASSWORD: string
- DB_LOG: boolean(false)

## Rest endpoints

Phases
- POST /api/phases
- GET /api/phases
- GET /api/phases/:id
- PUT /api/phases/:id
- DELETE /api/phases/:id

Tasks
- POST /api/tasks -> need name and phase_id
- GET /api/tasks
- PUT /api/tasks/:id
- DELETE /api/tasks/:id



## Current improvements
- Allow to delete tasks
- Allow to delete phases if it doesn't have related tasks
- Don't allow to create tasks if related phase is already done
- Force to mark phase as done by hand to ensure that create more task for that
  phase is not wanted (couldn't be possible if phase is done)
 
## Future improvements

- include comment field to detail each task
- Allow order phases
    - linked list through parent id (performance problem through subselect)
    - orderNum (problem when you want to change from 4 to 2 because need to change
      more rows)
    - probably  is better to use no relational db storing everything in the same
      document
- Allow mark phases as undone (need to take in account no next phases or tasks
  are already marked as done)
- Allow mark tasks as undone (need to take in account related phase is not
  already done)

