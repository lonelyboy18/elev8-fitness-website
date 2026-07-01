export interface ApiSuccess<T> {
  success: true;
  message?: string;
  data: T;
}

export interface ApiFailure {
  success: false;
  message?: string;
  errors?: Record<string, string>;
}

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export function isApiSuccess<T>(result: ApiResult<T>): result is ApiSuccess<T> {
  return result.success === true;
}
