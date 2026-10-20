import { Request } from "express";

export function getRouteTemplate(request: Request): string {
  if (!request.route) {
    return "(sem rota)";
  }

  const capturedBase: unknown = request.res?.locals.routeBase;
  const base: string =
    typeof capturedBase === "string" ? capturedBase : request.baseUrl;
  const path: string = request.route.path === "/" ? "" : request.route.path;

  return `${base}${path}`;
}
