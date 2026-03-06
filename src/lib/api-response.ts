export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
  errorCode?: string;
};

export function successResponse<T>(data: T, status = 200): Response {
  return Response.json({ success: true, data } satisfies ApiResponse<T>, {
    status,
  });
}

export function errorResponse(
  error: string,
  status = 400,
  errorCode?: string,
): Response {
  return Response.json(
    { success: false, error, ...(errorCode && { errorCode }) } satisfies ApiResponse,
    { status },
  );
}
