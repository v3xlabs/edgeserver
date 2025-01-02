/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

import { createFileRoute } from '@tanstack/react-router'

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as LoginImport } from './routes/login'
import { Route as DebugImport } from './routes/debug'
import { Route as BootstrapImport } from './routes/bootstrap'
import { Route as AuthedImport } from './routes/_authed'
import { Route as AuthedIndexImport } from './routes/_authed/index'
import { Route as AuthedSettingsSImport } from './routes/_authed/settings/_s'
import { Route as AuthedTeamTeamIdIndexImport } from './routes/_authed/team/$teamId/index'
import { Route as AuthedSiteSiteIdIndexImport } from './routes/_authed/site/$siteId/index'
import { Route as AuthedSettingsSIndexImport } from './routes/_authed/settings/_s.index'

// Create Virtual Routes

const AuthedSettingsImport = createFileRoute('/_authed/settings')()

// Create/Update Routes

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const DebugRoute = DebugImport.update({
  id: '/debug',
  path: '/debug',
  getParentRoute: () => rootRoute,
} as any)

const BootstrapRoute = BootstrapImport.update({
  id: '/bootstrap',
  path: '/bootstrap',
  getParentRoute: () => rootRoute,
} as any)

const AuthedRoute = AuthedImport.update({
  id: '/_authed',
  getParentRoute: () => rootRoute,
} as any)

const AuthedSettingsRoute = AuthedSettingsImport.update({
  id: '/settings',
  path: '/settings',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedIndexRoute = AuthedIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedSettingsSRoute = AuthedSettingsSImport.update({
  id: '/_s',
  getParentRoute: () => AuthedSettingsRoute,
} as any)

const AuthedTeamTeamIdIndexRoute = AuthedTeamTeamIdIndexImport.update({
  id: '/team/$teamId/',
  path: '/team/$teamId/',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedSiteSiteIdIndexRoute = AuthedSiteSiteIdIndexImport.update({
  id: '/site/$siteId/',
  path: '/site/$siteId/',
  getParentRoute: () => AuthedRoute,
} as any)

const AuthedSettingsSIndexRoute = AuthedSettingsSIndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => AuthedSettingsSRoute,
} as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/_authed': {
      id: '/_authed'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthedImport
      parentRoute: typeof rootRoute
    }
    '/bootstrap': {
      id: '/bootstrap'
      path: '/bootstrap'
      fullPath: '/bootstrap'
      preLoaderRoute: typeof BootstrapImport
      parentRoute: typeof rootRoute
    }
    '/debug': {
      id: '/debug'
      path: '/debug'
      fullPath: '/debug'
      preLoaderRoute: typeof DebugImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/_authed/': {
      id: '/_authed/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof AuthedIndexImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/settings': {
      id: '/_authed/settings'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof AuthedSettingsImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/settings/_s': {
      id: '/_authed/settings/_s'
      path: '/settings'
      fullPath: '/settings'
      preLoaderRoute: typeof AuthedSettingsSImport
      parentRoute: typeof AuthedSettingsRoute
    }
    '/_authed/settings/_s/': {
      id: '/_authed/settings/_s/'
      path: '/'
      fullPath: '/settings/'
      preLoaderRoute: typeof AuthedSettingsSIndexImport
      parentRoute: typeof AuthedSettingsSImport
    }
    '/_authed/site/$siteId/': {
      id: '/_authed/site/$siteId/'
      path: '/site/$siteId'
      fullPath: '/site/$siteId'
      preLoaderRoute: typeof AuthedSiteSiteIdIndexImport
      parentRoute: typeof AuthedImport
    }
    '/_authed/team/$teamId/': {
      id: '/_authed/team/$teamId/'
      path: '/team/$teamId'
      fullPath: '/team/$teamId'
      preLoaderRoute: typeof AuthedTeamTeamIdIndexImport
      parentRoute: typeof AuthedImport
    }
  }
}

// Create and export the route tree

interface AuthedSettingsSRouteChildren {
  AuthedSettingsSIndexRoute: typeof AuthedSettingsSIndexRoute
}

const AuthedSettingsSRouteChildren: AuthedSettingsSRouteChildren = {
  AuthedSettingsSIndexRoute: AuthedSettingsSIndexRoute,
}

const AuthedSettingsSRouteWithChildren = AuthedSettingsSRoute._addFileChildren(
  AuthedSettingsSRouteChildren,
)

interface AuthedSettingsRouteChildren {
  AuthedSettingsSRoute: typeof AuthedSettingsSRouteWithChildren
}

const AuthedSettingsRouteChildren: AuthedSettingsRouteChildren = {
  AuthedSettingsSRoute: AuthedSettingsSRouteWithChildren,
}

const AuthedSettingsRouteWithChildren = AuthedSettingsRoute._addFileChildren(
  AuthedSettingsRouteChildren,
)

interface AuthedRouteChildren {
  AuthedIndexRoute: typeof AuthedIndexRoute
  AuthedSettingsRoute: typeof AuthedSettingsRouteWithChildren
  AuthedSiteSiteIdIndexRoute: typeof AuthedSiteSiteIdIndexRoute
  AuthedTeamTeamIdIndexRoute: typeof AuthedTeamTeamIdIndexRoute
}

const AuthedRouteChildren: AuthedRouteChildren = {
  AuthedIndexRoute: AuthedIndexRoute,
  AuthedSettingsRoute: AuthedSettingsRouteWithChildren,
  AuthedSiteSiteIdIndexRoute: AuthedSiteSiteIdIndexRoute,
  AuthedTeamTeamIdIndexRoute: AuthedTeamTeamIdIndexRoute,
}

const AuthedRouteWithChildren =
  AuthedRoute._addFileChildren(AuthedRouteChildren)

export interface FileRoutesByFullPath {
  '': typeof AuthedRouteWithChildren
  '/bootstrap': typeof BootstrapRoute
  '/debug': typeof DebugRoute
  '/login': typeof LoginRoute
  '/': typeof AuthedIndexRoute
  '/settings': typeof AuthedSettingsSRouteWithChildren
  '/settings/': typeof AuthedSettingsSIndexRoute
  '/site/$siteId': typeof AuthedSiteSiteIdIndexRoute
  '/team/$teamId': typeof AuthedTeamTeamIdIndexRoute
}

export interface FileRoutesByTo {
  '/bootstrap': typeof BootstrapRoute
  '/debug': typeof DebugRoute
  '/login': typeof LoginRoute
  '/': typeof AuthedIndexRoute
  '/settings': typeof AuthedSettingsSIndexRoute
  '/site/$siteId': typeof AuthedSiteSiteIdIndexRoute
  '/team/$teamId': typeof AuthedTeamTeamIdIndexRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/_authed': typeof AuthedRouteWithChildren
  '/bootstrap': typeof BootstrapRoute
  '/debug': typeof DebugRoute
  '/login': typeof LoginRoute
  '/_authed/': typeof AuthedIndexRoute
  '/_authed/settings': typeof AuthedSettingsRouteWithChildren
  '/_authed/settings/_s': typeof AuthedSettingsSRouteWithChildren
  '/_authed/settings/_s/': typeof AuthedSettingsSIndexRoute
  '/_authed/site/$siteId/': typeof AuthedSiteSiteIdIndexRoute
  '/_authed/team/$teamId/': typeof AuthedTeamTeamIdIndexRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | ''
    | '/bootstrap'
    | '/debug'
    | '/login'
    | '/'
    | '/settings'
    | '/settings/'
    | '/site/$siteId'
    | '/team/$teamId'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/bootstrap'
    | '/debug'
    | '/login'
    | '/'
    | '/settings'
    | '/site/$siteId'
    | '/team/$teamId'
  id:
    | '__root__'
    | '/_authed'
    | '/bootstrap'
    | '/debug'
    | '/login'
    | '/_authed/'
    | '/_authed/settings'
    | '/_authed/settings/_s'
    | '/_authed/settings/_s/'
    | '/_authed/site/$siteId/'
    | '/_authed/team/$teamId/'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  AuthedRoute: typeof AuthedRouteWithChildren
  BootstrapRoute: typeof BootstrapRoute
  DebugRoute: typeof DebugRoute
  LoginRoute: typeof LoginRoute
}

const rootRouteChildren: RootRouteChildren = {
  AuthedRoute: AuthedRouteWithChildren,
  BootstrapRoute: BootstrapRoute,
  DebugRoute: DebugRoute,
  LoginRoute: LoginRoute,
}

export const routeTree = rootRoute
  ._addFileChildren(rootRouteChildren)
  ._addFileTypes<FileRouteTypes>()

/* ROUTE_MANIFEST_START
{
  "routes": {
    "__root__": {
      "filePath": "__root.tsx",
      "children": [
        "/_authed",
        "/bootstrap",
        "/debug",
        "/login"
      ]
    },
    "/_authed": {
      "filePath": "_authed.tsx",
      "children": [
        "/_authed/",
        "/_authed/settings",
        "/_authed/site/$siteId/",
        "/_authed/team/$teamId/"
      ]
    },
    "/bootstrap": {
      "filePath": "bootstrap.tsx"
    },
    "/debug": {
      "filePath": "debug.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/_authed/": {
      "filePath": "_authed/index.tsx",
      "parent": "/_authed"
    },
    "/_authed/settings": {
      "filePath": "_authed/settings",
      "parent": "/_authed",
      "children": [
        "/_authed/settings/_s"
      ]
    },
    "/_authed/settings/_s": {
      "filePath": "_authed/settings/_s.tsx",
      "parent": "/_authed/settings",
      "children": [
        "/_authed/settings/_s/"
      ]
    },
    "/_authed/settings/_s/": {
      "filePath": "_authed/settings/_s.index.tsx",
      "parent": "/_authed/settings/_s"
    },
    "/_authed/site/$siteId/": {
      "filePath": "_authed/site/$siteId/index.tsx",
      "parent": "/_authed"
    },
    "/_authed/team/$teamId/": {
      "filePath": "_authed/team/$teamId/index.tsx",
      "parent": "/_authed"
    }
  }
}
ROUTE_MANIFEST_END */
