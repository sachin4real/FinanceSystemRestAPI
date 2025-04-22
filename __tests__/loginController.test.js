import request from "supertest";
import app from "../app"; // Assuming your Express app is exported from app.js
import { connectDB, disconnectDB, createMockUser } from "./test-utils";

beforeAll(async () => {
    await connectDB();
});

afterAll(async () => {
    await disconnectDB();
});

describe("User Login Tests", () => {
    let user;

    beforeEach(async () => {
        // Create a mock user for login tests
        user = await createMockUser({
            name: "Test User",
            email: "testuser@example.com",
            password: "password123",
        });
    });

    it("should login a user successfully", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({
                email: user.email,
                password: "password123",
            });

        expect(res.status).toBe(200);
        expect(res.body).toHaveProperty("token");
        expect(res.body.name).toBe(user.name);
        expect(res.body.email).toBe(user.email);
    });

    it("should not login with invalid credentials", async () => {
        const res = await request(app)
            .post("/api/users/login")
            .send({
                email: "wrongemail@example.com",
                password: "wrongpassword",
            });

        expect(res.status).toBe(400);
        expect(res.body.message).toBe("Invalid credentials");
    });
});
