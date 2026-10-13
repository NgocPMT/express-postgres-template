import type { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import { HTTP_STATUS } from '../shared/constants/http-status.js';

const POSTGRES_ERROR = {
  UNIQUE_VIOLATION: '23505',
  FOREIGN_KEY_VIOLATION: '23503',
  INVALID_TEXT_REPRESENTATION: '22P02',
} as const;

function getStatusCode(error: unknown): number {
  if (error instanceof ZodError) {
    return HTTP_STATUS.HTTP_400_BAD_REQUEST;
  }

  if (typeof error === 'object' && error !== null) {
    const maybeCode = 'code' in error ? (error as { code?: unknown }).code : undefined;
    if (maybeCode === POSTGRES_ERROR.UNIQUE_VIOLATION) {
      return HTTP_STATUS.HTTP_409_CONFLICT;
    }
    if (
      maybeCode === POSTGRES_ERROR.FOREIGN_KEY_VIOLATION ||
      maybeCode === POSTGRES_ERROR.INVALID_TEXT_REPRESENTATION
    ) {
      return HTTP_STATUS.HTTP_400_BAD_REQUEST;
    }

    const maybeStatus = 'statusCode' in error ? (error as { statusCode?: unknown }).statusCode : undefined;
    if (typeof maybeStatus === 'number' && maybeStatus >= HTTP_STATUS.HTTP_400_BAD_REQUEST) {
      return maybeStatus;
    }

    const maybeStatusCode = 'status' in error ? (error as { status?: unknown }).status : undefined;
    if (typeof maybeStatusCode === 'number' && maybeStatusCode >= HTTP_STATUS.HTTP_400_BAD_REQUEST) {
      return maybeStatusCode;
    }
  }

  return HTTP_STATUS.HTTP_500_INTERNAL_SERVER_ERROR;
}

function getMessage(error: unknown): string {
  if (error instanceof ZodError) {
    return error.issues[0]?.message ?? 'Request validation failed';
  }

  if (typeof error === 'object' && error !== null) {
    const maybeCode = 'code' in error ? (error as { code?: unknown }).code : undefined;
    if (maybeCode === POSTGRES_ERROR.UNIQUE_VIOLATION) {
      const maybeDetail = 'detail' in error ? (error as { detail?: unknown }).detail : undefined;
      return typeof maybeDetail === 'string' ? maybeDetail : 'Unique constraint violation';
    }
    if (maybeCode === POSTGRES_ERROR.FOREIGN_KEY_VIOLATION) {
      return 'Foreign key constraint violation';
    }
    if (maybeCode === POSTGRES_ERROR.INVALID_TEXT_REPRESENTATION) {
      return 'Invalid input syntax';
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Internal server error';
}

function getErrorCode(error: unknown): string | undefined {
  if (typeof error !== 'object' || error === null) {
    return undefined;
  }

  const maybeCode = 'code' in error ? (error as { code?: unknown }).code : undefined;

  return typeof maybeCode === 'string' ? maybeCode : undefined;
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  const statusCode = getStatusCode(error);
  const message = getMessage(error);
  const code = getErrorCode(error);

  if (error instanceof ZodError) {
    res.status(statusCode).json({
      success: false,
      message,
      issues: error.issues,
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(code ? { code } : {}),
  });
};
