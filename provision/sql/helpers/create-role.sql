DO
$$
BEGIN
   IF NOT EXISTS (
      SELECT
      FROM   pg_catalog.pg_user
      WHERE  usename = 'owner') THEN

      CREATE ROLE owner WITH PASSWORD 'owner' CREATEDB LOGIN;
      ALTER USER "owner" with superuser;
   END IF;
END
$$;
