<a href="https://edgeserver.io" target="_blank">
  <p align="center">
    <picture>
      <source media="(prefers-color-scheme: dark)" srcset="./assets/edgeserver_light.png#" />
      <img alt="edgeserver.io bridging web2 to web3" src="./assets/edgeserver_dark.png#" width="100%" />
    </picture>
  </p>
</a>


## Introduction

[Edgeserver](https://edgeserver.io) is an open-source, self-hostable, web3-native static file hosting service that allows for seamless integration with your favourite CI/CD systems.

## Selfhosting

Due to the nature of edgeserver's architecture it is fully self-hostable and platform agnostic. All services are built to run as docker containers and horizontally scale to whatever demand might require. A guide for self-hosting is currently work in progress.

## Deploying on Edgeserver

## Storage Backend

The storage of data is a very important aspect and with 

## .edgerc specification

You can upload a file called `edgerc.json` together with your static site files to EdgeServer.

The file should follow the following format:

```ts
type EdgeRc = {
    app_id: string;
    config: {
        routing: {
            file_extensions: boolean;
            trailing_slash: "always" | "never" | "auto";

            default_route: string;
        };

        // Not yet supported
        headers: {
            pattern: string; // Regex pattern
            // Conditions that need to be true in order for the rule to apply
            conditions: {
                type: "header" | "cookie" | "host" | "query";
                key: string;
                value?: string;
            }[];
            // Headers to add when the rule is applied
            headers: {
                string: string;
            };
        }[];

        redirects: {
            pattern: string; // Regex pattern
            // Conditions that need to be true in order for the rule to apply
            conditions: {
                type: "header" | "cookie" | "host" | "query";
                key: string;
                value?: string;
            }[];
            status: 301 | 302 | 307;
            destination: string;
        }[];
        rewrites: {
            pattern: string; // Regex pattern
            // Conditions that need to be true in order for the rule to apply
            conditions: {
                type: "header" | "cookie" | "host" | "query";
                key: string;
                value?: string;
            }[];
            destination: string;
        }[];

        ssl: boolean;
    };
};
```
