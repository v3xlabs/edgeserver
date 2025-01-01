/* eslint-disable sonarjs/no-duplicate-string */
import {
    DefinedUseQueryResult,
    QueryObserverOptions,
    useQuery,
} from '@tanstack/react-query';

import { useAuth } from './auth';
import { paths } from './schema.gen';

export const BASE_URL =
    import.meta.env.VITE_API_URL || `${window.location.origin}/api/`;

type HTTPMethod =
    | 'get'
    | 'put'
    | 'post'
    | 'delete'
    | 'options'
    | 'head'
    | 'patch'
    | 'trace';

type PathMethods<TPath extends keyof paths> = {
    [TMethod in HTTPMethod]: paths[TPath][TMethod] extends undefined
    ? never
    : TMethod;
}[HTTPMethod];

type AnyRequestBody = {
    content: Record<string, any>;
};

type AnyResponses = Record<
    number,
    { content?: Record<string, any>; headers?: Record<string, any> }
>;

type AnyParameters = {
    query?: Record<string, any>;
    header?: Record<string, any>;
    path?: Record<string, any>;
    cookie?: Record<string, any>;
};

type AnyRoute = {
    responses: AnyResponses;
    requestBody?: AnyRequestBody;
    parameters: AnyParameters;
};

export type ApiResponse<TResponses extends AnyResponses> = {
    [TStatus in keyof TResponses]: TStatus extends number
    ? TResponses[TStatus]['content'] extends undefined
    ? {
        status: TStatus;
        contentType: never;
        data: never;
        headers: TResponses[TStatus]['headers'] extends Record<
            string,
            unknown
        >
        ? Map<
            keyof TResponses[TStatus]['headers'],
            TResponses[TStatus]['headers'][keyof TResponses[TStatus]['headers']]
        >
        : TResponses[TStatus]['headers'];
    }
    : {
        [K in keyof TResponses[TStatus]['content']]: {
            status: TStatus;
            contentType: K;
            data: TResponses[TStatus]['content'][K];
            headers: TResponses[TStatus]['headers'] extends Record<
                string,
                unknown
            >
            ? Map<
                keyof TResponses[TStatus]['headers'],
                TResponses[TStatus]['headers'][keyof TResponses[TStatus]['headers']]
            >
            : TResponses[TStatus]['headers'];
        };
    }[keyof TResponses[TStatus]['content']]
    : never;
}[keyof TResponses];

export type ApiRequestBody<TBody extends AnyRequestBody | undefined> =
    TBody extends AnyRequestBody
    ? {
        [K in keyof TBody['content']]: {
            contentType: K;
            data: TBody['content'][K];
        };
    }[keyof TBody['content']]
    : {
        contentType?: undefined;
        data?: undefined;
    };
type Prettify<T> = {
    [K in keyof T]: T[K];
} & {};

const convertBody = (
    data: any,
    contentType: string | undefined
): // eslint-disable-next-line no-undef
    BodyInit | undefined => {
    if (contentType === undefined) {
        return;
    }

    switch (contentType) {
    case 'application/json':
    case 'application/json; charset=utf-8':
        return JSON.stringify(data);
    default:
        throw new Error('Unsupported content type: ' + contentType);
    }
};

export class ApiError extends Error {
    // eslint-disable-next-line unused-imports/no-unused-vars
    constructor(message: string, public status: number) {
        super(message);
    }

    static fromResponse(response: Response) {
        return new ApiError(response.statusText, response.status);
    }
}

export type ApiRequest<
    TPath extends keyof paths,
    TMethod extends PathMethods<TPath>,
    TRoute extends AnyRoute = paths[TPath][TMethod] extends AnyRoute
    ? paths[TPath][TMethod]
    : never
> = Prettify<{
    path: TPath;
    method: TMethod;
    parameters: TRoute['parameters'];
    body: ApiRequestBody<TRoute['requestBody']>;
    response: ApiResponse<TRoute['responses']>;
}>;

/**
 * Makes a type-safe API request to the backend server.
 *
 * @description
 * This function provides a strongly-typed interface for making API requests based on your OpenAPI schema.
 * It handles authentication, request/response serialization, and error handling automatically.
 *
 * @example
 * Basic GET request:
 * ```ts
 * const response = await apiRequest('/items', 'get', {
 *   query: { limit: 10, offset: 0 }
 * });
 * // response.data is fully typed based on your API schema! 🎉
 * console.log(response.data.items);
 * ```
 *
 * @example
 * POST request with JSON body:
 * ```ts
 * const response = await apiRequest('/items', 'post', {
 *   contentType: 'application/json',
 *   data: {
 *     name: 'Cool Item',
 *     description: 'A very cool item indeed'
 *   }
 * });
 * ```
 *
 * @example
 * Using path parameters:
 * ```ts
 * const response = await apiRequest('/items/{itemId}', 'get', {
 *   path: { itemId: '123' }
 * });
 * ```
 *
 * @example
 * Adding custom headers:
 * ```ts
 * const response = await apiRequest('/items', 'get', {
 *   header: {
 *     'X-Custom-Header': 'value'
 *   }
 * });
 * ```
 *
 * @example
 * Handling errors:
 * ```ts
 * try {
 *   const response = await apiRequest('/items', 'get', {});
 * } catch (error) {
 *   if (error instanceof ApiError) {
 *     console.error(`API Error ${error.status}: ${error.message}`);
 *   }
 * }
 * ```
 *
 * @template TPath - The API endpoint path (must exist in your OpenAPI schema)
 * @template TMethod - The HTTP method to use (must be valid for the given path)
 * @template TOptions - Request options including query params, headers, and body
 * @template TRoute - Internal type representing the full route definition
 *
 * @param path - The API endpoint path (e.g., '/items')
 * @param method - The HTTP method to use (e.g., 'get', 'post')
 * @param options - Request configuration object containing:
 *   - query?: Record<string, any> - Query parameters
 *   - header?: Record<string, any> - Custom headers
 *   - path?: Record<string, any> - Path parameters
 *   - contentType?: string - Request content type
 *   - data?: any - Request body
 *   - fetchOptions?: RequestInit - Additional fetch options
 *
 * @returns A Promise resolving to a typed response object containing:
 *   - status: HTTP status code
 *   - contentType: Response content type (if applicable)
 *   - data: Response body (if applicable)
 *   - headers: Response headers
 *
 * @throws {ApiError} When the server returns a non-2xx status code
 * @throws {Error} When an unsupported content type is encountered
 */
export const apiRequest = async <
    TPath extends keyof paths,
    TMethod extends PathMethods<TPath>,
    TOptions extends TRoute['parameters'] &
    ApiRequestBody<TRoute['requestBody']> & {
        // eslint-disable-next-line no-undef
        fetchOptions?: RequestInit;
    },
    TRoute extends AnyRoute = paths[TPath][TMethod] extends AnyRoute
    ? paths[TPath][TMethod]
    : never
>(
    path: TPath,
    method: TMethod,
    options: TOptions
): Promise<Prettify<ApiResponse<TRoute['responses']>>> => {
    const {
        query,
        header,
        path: pathParameters,
        contentType,
        data,
        fetchOptions,
    } = options;

    if (pathParameters) {
        for (const [key, value] of Object.entries(pathParameters)) {
            path = path.replace(`{${key}}`, value) as TPath;
        }
    }

    const url = new URL(`.${path}`, BASE_URL);

    if (query) {
        for (const [key, value] of Object.entries(query)) {
            url.searchParams.set(key, value.toString());
        }
    }

    const headers = new Headers();

    if (header) {
        for (const [key, value] of Object.entries(header)) {
            headers.set(key, value.toString());
        }
    }

    const { token, clearAuthToken } = useAuth.getState();

    if (token) {
        headers.set('Authorization', 'Bearer ' + token);
    }

    if (contentType) {
        headers.set('Content-Type', contentType);
    }

    const response = await fetch(url, {
        method: method.toUpperCase(),
        headers,
        body: convertBody(data, contentType),
        ...fetchOptions,
    });

    if (response.status === 401) {
        if (token) {
            console.log('Token expired, clearing token');
            clearAuthToken();
        }

        throw new ApiError('Token expired', 401);
    }

    if (response.status === 403) {
        throw new ApiError('Forbidden', 403);
    }

    if (!response.ok) {
        throw ApiError.fromResponse(response);
    }

    const responseContentType = response.headers.get('content-type');

    switch (responseContentType) {
    // eslint-disable-next-line unicorn/no-null
    case null:
        return {
            status: response.status,
            headers: response.headers,
        } as any;

    case 'text/plain; charset=utf-8':
        return {
            status: response.status,
            contentType: responseContentType,
            data: await response.text(),
        } as any;

    case 'application/json; charset=utf-8':
        return {
            status: response.status,
            contentType: responseContentType,
            data: await response.json(),
            headers: response.headers,
        } as any;
    default:
        throw new Error('Unsupported content type: ' + responseContentType);
    }
};

/**
 * @deprecated Use `ApiRequest` instead
 */
type Request<
    TPath extends keyof paths,
    TMethod extends keyof paths[TPath]
> = paths[TPath][TMethod] extends {
    responses: Record<
        number,
        {
            content: Record<string, any>;
        }
    >;
}
    ? paths[TPath][TMethod]
    : never;
/**
 * @deprecated Use `ApiRequest` instead
 */
export type ResponseType<
    TPath extends keyof paths,
    TMethod extends keyof paths[TPath] = 'get',
    TStatus extends keyof Request<TPath, TMethod>['responses'] = 200
> = Request<TPath, TMethod>['responses'][TStatus] extends {
    content: Record<string, infer R>;
}
    ? R
    : never;

/**
 * @deprecated Use `ApiRequest` instead
 */
export type HttpOptions = {
    // Whether to include the token in the request
    // - 'include' will include the token if available
    // - 'ignore' will not include the token
    // - 'required' will throw an error if the token is not available
    auth?: 'include' | 'ignore' | 'required' | 'skip';
    skipIfUnauthed?: boolean;
};

/**
 * @deprecated Use `apiRequest` instead
 */
export const getHttp =
    <T>(url: string, options?: HttpOptions) =>
        async () => {
            const { token, clearAuthToken } = useAuth.getState();
            const { auth = 'ignore' } = options || {};

            const headers = new Headers();

            if (auth === 'include' || auth === 'required') {
                if (!token && auth === 'required') {
                    throw new Error(
                        'No token available but endpoint requires it, url: ' + url
                    );
                }

                if (token) {
                    headers.append('Authorization', 'Bearer ' + token);
                }
            }

            try {
                const response = await fetch(new URL(url, BASE_URL), { headers });

                if (response.status === 401) {
                    if (token) {
                        console.log('Token expired, clearing token');
                        clearAuthToken();
                    }

                    throw new Error('Token expired');
                }

                if (!response.ok) {
                    throw new Error(response.statusText);
                }

                return (await response.json()) as T;
            } catch (error) {
                console.error(error);
                throw error;
            }
        };

/**
 * @deprecated Use `useQuery` instead
 */
export function useHttp<T>(
    key: string,
    options?: HttpOptions,
    queryOptions?: Partial<QueryObserverOptions>
): DefinedUseQueryResult<T, Error> {
    const { token } = useAuth();
    const { auth = 'ignore', skipIfUnauthed = false } = options || {};

    return useQuery({
        queryKey: [key],
        enabled: auth !== 'required' || !!token,
        queryFn: getHttp(key, options),
        ...queryOptions,
    }) as DefinedUseQueryResult<T, Error>;
}
