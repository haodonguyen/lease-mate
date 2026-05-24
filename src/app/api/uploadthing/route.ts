import { createRouteHandler } from "uploadthing/next";
import { leaseMateFileRouter } from "./core";

export const { GET, POST } = createRouteHandler({
  router: leaseMateFileRouter,
});
