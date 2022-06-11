# oaks-back-assignment
Oak's Lab backend assignment 

## Commands

- npm run build -> Create the build
- npm run start -> Create the build and starts the server
- npm run local -> Launch the server locally including nodemon watcher
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

-   SERVER_PORT: number(8080)
-   LOG_LEVEL: {debug, info, warn, error}(warn)
-   SENTRY_DSN: string(''')
-   SENTRY_ENVIRONMENT: string(''')
-   SENTRY_RELEASE: string(''')
-   DB_HOST: string
-   DB_PORT: string
-   DB_NAME: string
-   DB_USERNAME: string
-   DB_PASSWORD: string
-   DB_LOG: boolean(false)
