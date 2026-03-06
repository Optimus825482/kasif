import { describe, it, expect } from "vitest";
import { successResponse, errorResponse } from "./api-response";

describe("api-response", () => {
  describe("successResponse", () => {
    it("returns 200 and body with success true and data", async () => {
      const res = successResponse({ id: "1", name: "Test" });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ id: "1", name: "Test" });
    });

    it("accepts custom status", async () => {
      const res = successResponse({ created: true }, 201);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toEqual({ created: true });
    });
  });

  describe("errorResponse", () => {
    it("returns 400 by default with success false and error message", async () => {
      const res = errorResponse("Bad request");
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Bad request");
      expect(body.errorCode).toBeUndefined();
    });

    it("accepts custom status and errorCode", async () => {
      const res = errorResponse("Unauthorized", 401, "UNAUTHORIZED");
      expect(res.status).toBe(401);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error).toBe("Unauthorized");
      expect(body.errorCode).toBe("UNAUTHORIZED");
    });

    it("omits errorCode when not provided", async () => {
      const res = errorResponse("Not found", 404);
      const body = await res.json();
      expect(body.errorCode).toBeUndefined();
    });
  });
});
