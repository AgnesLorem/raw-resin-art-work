// functions/api/_middleware.js

/**
 * Middleware to inject security headers for all API responses under /api/*
 */
export async function onRequest(context) {
  const response = await context.next();
  
  // Reconstruct response to allow header modifications (response headers are immutable by default)
  const secureResponse = new Response(response.body, response);
  
  // Set security headers
  secureResponse.headers.set('X-Content-Type-Options', 'nosniff');
  secureResponse.headers.set('Cache-Control', 'no-store');
  
  return secureResponse;
}
