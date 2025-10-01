import { HttpMethod } from '../types/common.types.js';

/**
 * API Request Builder - Hàm gọi lại nhiều lần để xây dựng API calls
 */
export class ApiRequestBuilder {
  private config: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
    }
  };
  private baseUrl: string = '';
  private endpoint: string = '';
  private queryParams: Record<string, string> = {};

  /**
   * Set base URL
   */
  base(url: string): ApiRequestBuilder {
    this.baseUrl = url.endsWith('/') ? url.slice(0, -1) : url;
    return this;
  }

  /**
   * Set endpoint
   */
  url(endpoint: string): ApiRequestBuilder {
    this.endpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    return this;
  }

  /**
   * Set HTTP method
   */
  method(method: HttpMethod): ApiRequestBuilder {
    this.config.method = method;
    return this;
  }

  /**
   * Set request body
   */
  body(data: any): ApiRequestBuilder {
    this.config.body = JSON.stringify(data);
    return this;
  }

  /**
   * Add header
   */
  header(key: string, value: string): ApiRequestBuilder {
    if (!this.config.headers) {
      this.config.headers = {};
    }
    (this.config.headers as Record<string, string>)[key] = value;
    return this;
  }

  /**
   * Add authorization header
   */
  auth(token: string, type: 'Bearer' | 'Basic' = 'Bearer'): ApiRequestBuilder {
    return this.header('Authorization', `${type} ${token}`);
  }

  /**
   * Add query parameter
   */
  query(key: string, value: string | number | boolean): ApiRequestBuilder {
    this.queryParams[key] = String(value);
    return this;
  }

  /**
   * Add multiple query parameters
   */
  queries(params: Record<string, string | number | boolean>): ApiRequestBuilder {
    Object.entries(params).forEach(([key, value]) => {
      this.queryParams[key] = String(value);
    });
    return this;
  }

  /**
   * Set timeout
   */
  timeout(ms: number): ApiRequestBuilder {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), ms);
    this.config.signal = controller.signal;
    return this;
  }

  /**
   * Build final URL with query parameters
   */
  private buildUrl(): string {
    let fullUrl = `${this.baseUrl}${this.endpoint}`;
    
    const queryString = new URLSearchParams(this.queryParams).toString();
    if (queryString) {
      fullUrl += `?${queryString}`;
    }
    
    return fullUrl;
  }

  /**
   * Execute the request
   */
  async execute<T = any>(): Promise<T> {
    const url = this.buildUrl();
    const response = await fetch(url, this.config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    
    return await response.text() as T;
  }

  /**
   * Get request configuration (for debugging)
   */
  getConfig(): { url: string; config: RequestInit } {
    return {
      url: this.buildUrl(),
      config: this.config
    };
  }
}

/**
 * Quick API helper functions
 */
export const api = {
  /**
   * GET request
   */
  get: (url: string) => new ApiRequestBuilder().method(HttpMethod.GET).url(url),
  
  /**
   * POST request
   */
  post: (url: string, data?: any) => {
    const builder = new ApiRequestBuilder().method(HttpMethod.POST).url(url);
    return data ? builder.body(data) : builder;
  },
  
  /**
   * PUT request
   */
  put: (url: string, data?: any) => {
    const builder = new ApiRequestBuilder().method(HttpMethod.PUT).url(url);
    return data ? builder.body(data) : builder;
  },
  
  /**
   * PATCH request
   */
  patch: (url: string, data?: any) => {
    const builder = new ApiRequestBuilder().method(HttpMethod.PATCH).url(url);
    return data ? builder.body(data) : builder;
  },
  
  /**
   * DELETE request
   */
  delete: (url: string) => new ApiRequestBuilder().method(HttpMethod.DELETE).url(url)
};

/**
 * Retry utility - Hàm gọi lại nhiều lần với retry logic
 */
export class RetryBuilder {
  private maxRetries: number = 3;
  private delay: number = 1000;
  private backoff: number = 2;
  private retryCondition: (error: any) => boolean = () => true;

  /**
   * Set maximum number of retries
   */
  retries(count: number): RetryBuilder {
    this.maxRetries = count;
    return this;
  }

  /**
   * Set initial delay between retries (ms)
   */
  delayMs(ms: number): RetryBuilder {
    this.delay = ms;
    return this;
  }

  /**
   * Set backoff multiplier
   */
  backoffMultiplier(multiplier: number): RetryBuilder {
    this.backoff = multiplier;
    return this;
  }

  /**
   * Set condition for when to retry
   */
  when(condition: (error: any) => boolean): RetryBuilder {
    this.retryCondition = condition;
    return this;
  }

  /**
   * Execute function with retry logic
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    let currentDelay = this.delay;

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        if (attempt === this.maxRetries || !this.retryCondition(error)) {
          throw error;
        }
        
        // Wait before next retry
        await new Promise(resolve => setTimeout(resolve, currentDelay));
        currentDelay *= this.backoff;
      }
    }
    
    throw lastError;
  }
}

/**
 * Quick retry function
 */
export const retry = () => new RetryBuilder();
