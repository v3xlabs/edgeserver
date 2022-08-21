import { JSONSchemaType } from 'ajv';

import {
    Condition,
    Edgerc,
    EdgeRcConfig,
    HeaderRule,
    RedirectRule,
    RewriteRule,
    RoutingConfig,
} from '../../types/ConfigFile.type';

const routingSchema: JSONSchemaType<RoutingConfig> = {
    type: 'object',
    properties: {
        file_extensions: {
            type: 'boolean',
            nullable: true,
        },
        trailing_slash: {
            type: 'string',
            nullable: true,
        },
        default_route: {
            type: 'string',
            nullable: true,
        },
    },
    required: [],
    nullable: true,
    additionalProperties: false,
};

const conditionSchema: JSONSchemaType<Condition> = {
    type: 'object',
    properties: {
        type: {
            type: 'string',
        },
        key: {
            type: 'string',
        },
        value: {
            type: 'string',
            nullable: true,
        },
    },
    required: ['type', 'key'],
    additionalProperties: false,
};

const headerRuleSchema: JSONSchemaType<HeaderRule> = {
    type: 'object',
    properties: {
        pattern: {
            type: 'string',
        },

        conditions: {
            type: 'array',
            items: conditionSchema,
            nullable: true,
        },

        headers: {
            type: 'object',
            additionalProperties: true,
            required: [],
        },
    },
    required: ['pattern', 'headers'],
    additionalProperties: false,
};

const redirectRuleSchema: JSONSchemaType<RedirectRule> = {
    type: 'object',
    properties: {
        pattern: {
            type: 'string',
        },

        conditions: {
            type: 'array',
            items: conditionSchema,
            nullable: true,
        },

        status: {
            type: 'integer',
            nullable: true,
        },

        destination: {
            type: 'string',
        },
    },
    required: ['pattern', 'destination'],
    additionalProperties: false,
};

const rewriteRuleSchema: JSONSchemaType<RewriteRule> = {
    type: 'object',
    properties: {
        pattern: {
            type: 'string',
        },

        conditions: {
            type: 'array',
            items: conditionSchema,
            nullable: true,
        },

        destination: {
            type: 'string',
        },
    },
    required: ['pattern', 'destination'],
    additionalProperties: false,
};

const edgeRcConfigSchema: JSONSchemaType<EdgeRcConfig> = {
    type: 'object',
    properties: {
        routing: {
            type: 'object',
            properties: {
                file_extensions: {
                    type: 'boolean',
                    nullable: true,
                },
                trailing_slash: {
                    type: 'string',
                    nullable: true,
                },
                default_route: {
                    type: 'string',
                    nullable: true,
                },
            },
            required: [],
            nullable: true,
        },

        headers: {
            type: 'array',
            items: headerRuleSchema,
            nullable: true,
        },

        redirects: {
            type: 'array',
            items: redirectRuleSchema,
            nullable: true,
        },

        rewrites: {
            type: 'array',
            items: rewriteRuleSchema,
            nullable: true,
        },

        ssl: {
            type: 'boolean',
            nullable: true,
        },
    },
    required: [],
    additionalProperties: false,
};

export const edgeRcSchema: JSONSchemaType<Edgerc> = {
    type: 'object',
    properties: {
        app_id: {
            type: 'string',
        },
        config: edgeRcConfigSchema,
    },
    required: ['app_id', 'config'],
    additionalProperties: false,
};
