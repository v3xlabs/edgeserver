# API Endpoints:
## Deployments
### ls (GET)
id of each deployment you have access to

**Path**: `GET /deployments/ls`

**Returns**:

```json
[
    {
        "site_id": "1",
        "domain": "example.com",
        "owner_id": "1",
    },
    {
        "site_id": "2",
        "domain": "second-example.com",
        "owner_id": "1",
    }
]
```

### create (POST)
Create a new deployment

**Auth**: `JWT`

**Path**: `POST /deployments/create`

**Body**:
```json
{
    "deployment": "v1.example.com",
}
```

**Returns**

```json
{
    "site_id": "1",
}
```

### permissions (PUT)

**Auth**: `Wallet Signature`

**Path**: `POST /deployments/permissions`

**Body**:
```json
{
    "message": {
        "instance_id": "1",
        "project_id": "1",
        "user_id": "1",
        "permission": "permission_bit"
    },
    "signature": "hash"
}
```

**Returns**:

```json
200 OK
```

# Definitions

## Application (App)
Is a single instance, card/list_item on homescreen, has settings, etc etc.

## Deployment (Deploy)
Single instance of a deployment in a collection of deployments belonging to an app

## Domain
Domain Data with its corresponding owner_id aswell as permissions for subdomains etc


# Application Structure


## **DLT**:

- base_url
- app_id
- deployment_id

```
Base URL => Deployment 
foo.bar.com => DeploymentFOOBAR
bar.com => DeploymentBAR
```

## **DOT**: (wip)

- domain_id PRIMARY
- domain
- user_id
- ownership_json

## **Deployment**
   - app_id COMPOSITE
   - deploy_id PRIMARY COMPOSITE
   - timestamp
   - sid
   - cid

## **Application**
   - app_id
   - owner_id
   - domain_id
   - permissions

(app_id, deploy_id)