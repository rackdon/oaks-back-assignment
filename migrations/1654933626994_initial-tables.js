/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = pgm => {
    pgm.createExtension('uuid-ossp', {ifNotExists: true})
    pgm.createTable('phases', {
        id: { type: 'uuid',
            default: pgm.func('uuid_generate_v4()'),
            notNull: true,
            primaryKey: true},
        name: { type: 'text', notNull: true,
            unique: true},
        done: { type: 'boolean', notNull: true,
            default: false},
        created_on: {
            type: 'timestamp without time zone',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_on: {
            type: 'timestamp without time zone',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    }, {ifNotExists: true})
    pgm.createTable('tasks', {
        id: { type: 'uuid',
            default: pgm.func('uuid_generate_v4()'),
            notNull: true,
            primaryKey: true},

        phase_id: { type: 'uuid',
            notNull: true,
        references: '"phases"'},
        name: { type: 'text', notNull: true},
        done: { type: 'boolean', notNull: true,
            default: false},
        created_on: {
            type: 'timestamp without time zone',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
        updated_on: {
            type: 'timestamp without time zone',
            notNull: true,
            default: pgm.func('current_timestamp'),
        },
    }, {ifNotExists: true})
};

exports.down = pgm => {
    pgm.dropTable('tasks');
    pgm.dropTable('phases');
};
