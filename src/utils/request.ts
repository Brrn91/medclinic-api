import { Request } from "express";

export function getRouteTemplate(request: Request): string {
  return request.route
    ? `${request.baseUrl}${request.route.path}`
    : "(sem rota)";
}
