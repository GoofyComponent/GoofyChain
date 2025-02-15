/* eslint-disable */

// @ts-nocheck

// noinspection JSUnusedGlobalSymbols

// This file was automatically generated by TanStack Router.
// You should NOT make any changes in this file as it will be overwritten.
// Additionally, you should also exclude this file from your linter and/or formatter to prevent it from being checked or modified.

// Import Routes

import { Route as rootRoute } from './routes/__root'
import { Route as RegisterImport } from './routes/register'
import { Route as LoginImport } from './routes/login'
import { Route as ForgotPasswordConfirmationImport } from './routes/forgot-password-confirmation'
import { Route as ForgotPasswordImport } from './routes/forgot-password'
import { Route as AuthenticatedImport } from './routes/_authenticated'
import { Route as IndexImport } from './routes/index'
import { Route as ResetPasswordTokenImport } from './routes/reset-password/$token'
import { Route as CallbackUserErrorImport } from './routes/callback/userError'
import { Route as AuthenticatedDashboardImport } from './routes/_authenticated/dashboard'
import { Route as AuthenticatedOnboardWalletKeyImport } from './routes/_authenticated/onboard/wallet-key'
import { Route as AuthenticatedOnboardCurrencyImport } from './routes/_authenticated/onboard/currency'
import { Route as AuthenticatedDashboardSummaryImport } from './routes/_authenticated/dashboard/summary'
import { Route as AuthenticatedDashboardSettingsImport } from './routes/_authenticated/dashboard/settings'

// Create/Update Routes

const RegisterRoute = RegisterImport.update({
  id: '/register',
  path: '/register',
  getParentRoute: () => rootRoute,
} as any)

const LoginRoute = LoginImport.update({
  id: '/login',
  path: '/login',
  getParentRoute: () => rootRoute,
} as any)

const ForgotPasswordConfirmationRoute = ForgotPasswordConfirmationImport.update(
  {
    id: '/forgot-password-confirmation',
    path: '/forgot-password-confirmation',
    getParentRoute: () => rootRoute,
  } as any,
)

const ForgotPasswordRoute = ForgotPasswordImport.update({
  id: '/forgot-password',
  path: '/forgot-password',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedRoute = AuthenticatedImport.update({
  id: '/_authenticated',
  getParentRoute: () => rootRoute,
} as any)

const IndexRoute = IndexImport.update({
  id: '/',
  path: '/',
  getParentRoute: () => rootRoute,
} as any)

const ResetPasswordTokenRoute = ResetPasswordTokenImport.update({
  id: '/reset-password/$token',
  path: '/reset-password/$token',
  getParentRoute: () => rootRoute,
} as any)

const CallbackUserErrorRoute = CallbackUserErrorImport.update({
  id: '/callback/userError',
  path: '/callback/userError',
  getParentRoute: () => rootRoute,
} as any)

const AuthenticatedDashboardRoute = AuthenticatedDashboardImport.update({
  id: '/dashboard',
  path: '/dashboard',
  getParentRoute: () => AuthenticatedRoute,
} as any)

const AuthenticatedOnboardWalletKeyRoute =
  AuthenticatedOnboardWalletKeyImport.update({
    id: '/onboard/wallet-key',
    path: '/onboard/wallet-key',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedOnboardCurrencyRoute =
  AuthenticatedOnboardCurrencyImport.update({
    id: '/onboard/currency',
    path: '/onboard/currency',
    getParentRoute: () => AuthenticatedRoute,
  } as any)

const AuthenticatedDashboardSummaryRoute =
  AuthenticatedDashboardSummaryImport.update({
    id: '/summary',
    path: '/summary',
    getParentRoute: () => AuthenticatedDashboardRoute,
  } as any)

const AuthenticatedDashboardSettingsRoute =
  AuthenticatedDashboardSettingsImport.update({
    id: '/settings',
    path: '/settings',
    getParentRoute: () => AuthenticatedDashboardRoute,
  } as any)

// Populate the FileRoutesByPath interface

declare module '@tanstack/react-router' {
  interface FileRoutesByPath {
    '/': {
      id: '/'
      path: '/'
      fullPath: '/'
      preLoaderRoute: typeof IndexImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated': {
      id: '/_authenticated'
      path: ''
      fullPath: ''
      preLoaderRoute: typeof AuthenticatedImport
      parentRoute: typeof rootRoute
    }
    '/forgot-password': {
      id: '/forgot-password'
      path: '/forgot-password'
      fullPath: '/forgot-password'
      preLoaderRoute: typeof ForgotPasswordImport
      parentRoute: typeof rootRoute
    }
    '/forgot-password-confirmation': {
      id: '/forgot-password-confirmation'
      path: '/forgot-password-confirmation'
      fullPath: '/forgot-password-confirmation'
      preLoaderRoute: typeof ForgotPasswordConfirmationImport
      parentRoute: typeof rootRoute
    }
    '/login': {
      id: '/login'
      path: '/login'
      fullPath: '/login'
      preLoaderRoute: typeof LoginImport
      parentRoute: typeof rootRoute
    }
    '/register': {
      id: '/register'
      path: '/register'
      fullPath: '/register'
      preLoaderRoute: typeof RegisterImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/dashboard': {
      id: '/_authenticated/dashboard'
      path: '/dashboard'
      fullPath: '/dashboard'
      preLoaderRoute: typeof AuthenticatedDashboardImport
      parentRoute: typeof AuthenticatedImport
    }
    '/callback/userError': {
      id: '/callback/userError'
      path: '/callback/userError'
      fullPath: '/callback/userError'
      preLoaderRoute: typeof CallbackUserErrorImport
      parentRoute: typeof rootRoute
    }
    '/reset-password/$token': {
      id: '/reset-password/$token'
      path: '/reset-password/$token'
      fullPath: '/reset-password/$token'
      preLoaderRoute: typeof ResetPasswordTokenImport
      parentRoute: typeof rootRoute
    }
    '/_authenticated/dashboard/settings': {
      id: '/_authenticated/dashboard/settings'
      path: '/settings'
      fullPath: '/dashboard/settings'
      preLoaderRoute: typeof AuthenticatedDashboardSettingsImport
      parentRoute: typeof AuthenticatedDashboardImport
    }
    '/_authenticated/dashboard/summary': {
      id: '/_authenticated/dashboard/summary'
      path: '/summary'
      fullPath: '/dashboard/summary'
      preLoaderRoute: typeof AuthenticatedDashboardSummaryImport
      parentRoute: typeof AuthenticatedDashboardImport
    }
    '/_authenticated/onboard/currency': {
      id: '/_authenticated/onboard/currency'
      path: '/onboard/currency'
      fullPath: '/onboard/currency'
      preLoaderRoute: typeof AuthenticatedOnboardCurrencyImport
      parentRoute: typeof AuthenticatedImport
    }
    '/_authenticated/onboard/wallet-key': {
      id: '/_authenticated/onboard/wallet-key'
      path: '/onboard/wallet-key'
      fullPath: '/onboard/wallet-key'
      preLoaderRoute: typeof AuthenticatedOnboardWalletKeyImport
      parentRoute: typeof AuthenticatedImport
    }
  }
}

// Create and export the route tree

interface AuthenticatedDashboardRouteChildren {
  AuthenticatedDashboardSettingsRoute: typeof AuthenticatedDashboardSettingsRoute
  AuthenticatedDashboardSummaryRoute: typeof AuthenticatedDashboardSummaryRoute
}

const AuthenticatedDashboardRouteChildren: AuthenticatedDashboardRouteChildren =
  {
    AuthenticatedDashboardSettingsRoute: AuthenticatedDashboardSettingsRoute,
    AuthenticatedDashboardSummaryRoute: AuthenticatedDashboardSummaryRoute,
  }

const AuthenticatedDashboardRouteWithChildren =
  AuthenticatedDashboardRoute._addFileChildren(
    AuthenticatedDashboardRouteChildren,
  )

interface AuthenticatedRouteChildren {
  AuthenticatedDashboardRoute: typeof AuthenticatedDashboardRouteWithChildren
  AuthenticatedOnboardCurrencyRoute: typeof AuthenticatedOnboardCurrencyRoute
  AuthenticatedOnboardWalletKeyRoute: typeof AuthenticatedOnboardWalletKeyRoute
}

const AuthenticatedRouteChildren: AuthenticatedRouteChildren = {
  AuthenticatedDashboardRoute: AuthenticatedDashboardRouteWithChildren,
  AuthenticatedOnboardCurrencyRoute: AuthenticatedOnboardCurrencyRoute,
  AuthenticatedOnboardWalletKeyRoute: AuthenticatedOnboardWalletKeyRoute,
}

const AuthenticatedRouteWithChildren = AuthenticatedRoute._addFileChildren(
  AuthenticatedRouteChildren,
)

export interface FileRoutesByFullPath {
  '/': typeof IndexRoute
  '': typeof AuthenticatedRouteWithChildren
  '/forgot-password': typeof ForgotPasswordRoute
  '/forgot-password-confirmation': typeof ForgotPasswordConfirmationRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/dashboard': typeof AuthenticatedDashboardRouteWithChildren
  '/callback/userError': typeof CallbackUserErrorRoute
  '/reset-password/$token': typeof ResetPasswordTokenRoute
  '/dashboard/settings': typeof AuthenticatedDashboardSettingsRoute
  '/dashboard/summary': typeof AuthenticatedDashboardSummaryRoute
  '/onboard/currency': typeof AuthenticatedOnboardCurrencyRoute
  '/onboard/wallet-key': typeof AuthenticatedOnboardWalletKeyRoute
}

export interface FileRoutesByTo {
  '/': typeof IndexRoute
  '': typeof AuthenticatedRouteWithChildren
  '/forgot-password': typeof ForgotPasswordRoute
  '/forgot-password-confirmation': typeof ForgotPasswordConfirmationRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/dashboard': typeof AuthenticatedDashboardRouteWithChildren
  '/callback/userError': typeof CallbackUserErrorRoute
  '/reset-password/$token': typeof ResetPasswordTokenRoute
  '/dashboard/settings': typeof AuthenticatedDashboardSettingsRoute
  '/dashboard/summary': typeof AuthenticatedDashboardSummaryRoute
  '/onboard/currency': typeof AuthenticatedOnboardCurrencyRoute
  '/onboard/wallet-key': typeof AuthenticatedOnboardWalletKeyRoute
}

export interface FileRoutesById {
  __root__: typeof rootRoute
  '/': typeof IndexRoute
  '/_authenticated': typeof AuthenticatedRouteWithChildren
  '/forgot-password': typeof ForgotPasswordRoute
  '/forgot-password-confirmation': typeof ForgotPasswordConfirmationRoute
  '/login': typeof LoginRoute
  '/register': typeof RegisterRoute
  '/_authenticated/dashboard': typeof AuthenticatedDashboardRouteWithChildren
  '/callback/userError': typeof CallbackUserErrorRoute
  '/reset-password/$token': typeof ResetPasswordTokenRoute
  '/_authenticated/dashboard/settings': typeof AuthenticatedDashboardSettingsRoute
  '/_authenticated/dashboard/summary': typeof AuthenticatedDashboardSummaryRoute
  '/_authenticated/onboard/currency': typeof AuthenticatedOnboardCurrencyRoute
  '/_authenticated/onboard/wallet-key': typeof AuthenticatedOnboardWalletKeyRoute
}

export interface FileRouteTypes {
  fileRoutesByFullPath: FileRoutesByFullPath
  fullPaths:
    | '/'
    | ''
    | '/forgot-password'
    | '/forgot-password-confirmation'
    | '/login'
    | '/register'
    | '/dashboard'
    | '/callback/userError'
    | '/reset-password/$token'
    | '/dashboard/settings'
    | '/dashboard/summary'
    | '/onboard/currency'
    | '/onboard/wallet-key'
  fileRoutesByTo: FileRoutesByTo
  to:
    | '/'
    | ''
    | '/forgot-password'
    | '/forgot-password-confirmation'
    | '/login'
    | '/register'
    | '/dashboard'
    | '/callback/userError'
    | '/reset-password/$token'
    | '/dashboard/settings'
    | '/dashboard/summary'
    | '/onboard/currency'
    | '/onboard/wallet-key'
  id:
    | '__root__'
    | '/'
    | '/_authenticated'
    | '/forgot-password'
    | '/forgot-password-confirmation'
    | '/login'
    | '/register'
    | '/_authenticated/dashboard'
    | '/callback/userError'
    | '/reset-password/$token'
    | '/_authenticated/dashboard/settings'
    | '/_authenticated/dashboard/summary'
    | '/_authenticated/onboard/currency'
    | '/_authenticated/onboard/wallet-key'
  fileRoutesById: FileRoutesById
}

export interface RootRouteChildren {
  IndexRoute: typeof IndexRoute
  AuthenticatedRoute: typeof AuthenticatedRouteWithChildren
  ForgotPasswordRoute: typeof ForgotPasswordRoute
  ForgotPasswordConfirmationRoute: typeof ForgotPasswordConfirmationRoute
  LoginRoute: typeof LoginRoute
  RegisterRoute: typeof RegisterRoute
  CallbackUserErrorRoute: typeof CallbackUserErrorRoute
  ResetPasswordTokenRoute: typeof ResetPasswordTokenRoute
}

const rootRouteChildren: RootRouteChildren = {
  IndexRoute: IndexRoute,
  AuthenticatedRoute: AuthenticatedRouteWithChildren,
  ForgotPasswordRoute: ForgotPasswordRoute,
  ForgotPasswordConfirmationRoute: ForgotPasswordConfirmationRoute,
  LoginRoute: LoginRoute,
  RegisterRoute: RegisterRoute,
  CallbackUserErrorRoute: CallbackUserErrorRoute,
  ResetPasswordTokenRoute: ResetPasswordTokenRoute,
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
        "/",
        "/_authenticated",
        "/forgot-password",
        "/forgot-password-confirmation",
        "/login",
        "/register",
        "/callback/userError",
        "/reset-password/$token"
      ]
    },
    "/": {
      "filePath": "index.tsx"
    },
    "/_authenticated": {
      "filePath": "_authenticated.tsx",
      "children": [
        "/_authenticated/dashboard",
        "/_authenticated/onboard/currency",
        "/_authenticated/onboard/wallet-key"
      ]
    },
    "/forgot-password": {
      "filePath": "forgot-password.tsx"
    },
    "/forgot-password-confirmation": {
      "filePath": "forgot-password-confirmation.tsx"
    },
    "/login": {
      "filePath": "login.tsx"
    },
    "/register": {
      "filePath": "register.tsx"
    },
    "/_authenticated/dashboard": {
      "filePath": "_authenticated/dashboard.tsx",
      "parent": "/_authenticated",
      "children": [
        "/_authenticated/dashboard/settings",
        "/_authenticated/dashboard/summary"
      ]
    },
    "/callback/userError": {
      "filePath": "callback/userError.tsx"
    },
    "/reset-password/$token": {
      "filePath": "reset-password/$token.tsx"
    },
    "/_authenticated/dashboard/settings": {
      "filePath": "_authenticated/dashboard/settings.tsx",
      "parent": "/_authenticated/dashboard"
    },
    "/_authenticated/dashboard/summary": {
      "filePath": "_authenticated/dashboard/summary.tsx",
      "parent": "/_authenticated/dashboard"
    },
    "/_authenticated/onboard/currency": {
      "filePath": "_authenticated/onboard/currency.tsx",
      "parent": "/_authenticated"
    },
    "/_authenticated/onboard/wallet-key": {
      "filePath": "_authenticated/onboard/wallet-key.tsx",
      "parent": "/_authenticated"
    }
  }
}
ROUTE_MANIFEST_END */
