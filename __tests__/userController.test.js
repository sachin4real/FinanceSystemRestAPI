import request from "supertest";
import app from "../app";  // Assuming your Express app is exported from app.js
import { connectDB, disconnectDB, createMockUser } from "./test-utils";
import User from "../models/User.model.js";

// Set up the database connection before each test
beforeAll(async () => {
    await connectDB();
});

// Clean up after each test
afterAll(async () => {
    await disconnectDB();
});

describe("User Controller Tests", () => {
    let token;

    // Create a mock admin user before each test
    beforeEach(async () => {
        // Create a user for login
        const adminUser = {
            name: "Admin User",
            email: "admin@example.com",
            password: "password123",
            role: "admin",
        };

        // Create and login the admin user to get a token
        const res = await request(app).post("/api/users/login").send(adminUser);
        token = res.body.token;
    });

    it("should register a new user successfully", async () => {
        const newUser = {
            name: "New User",
            email: "newuser@example.com",
            password: "password123",
        };

        const res = await request(app)
            .post("/api/users/register")
            .set("Authorization", `Bearer ${token}`)  // Passing admin token
            .send(newUser);

        expect(res.status).toBe(201);
        expect(res.body).toHaveProperty("token");
        expect(res.body.name).toBe(newUser.name);
        expect(res.body.email).toBe(newUser.email);
    });

    it("should not allow non-admin users to create an admin", async () => {
        const nonAdminUser = {
            name: "Regular User",
            email: "regular@example.com",
            password: "password123",
            role: "user",
        };

        // Create a regular user and login
        const res = await request(app).post("/api/users/login").send(nonAdminUser);
        const regularUserToken = res.body.token;

        // Attempt to register an admin using a regular user token
        const newAdmin = {
            name: "New Admin",
            email: "newadmin@example.com",
            password: "password123",
            role: "admin",
        };

        const registerRes = await request(app)
            .post("/api/users/register")
            .set("Authorization", `Bearer ${regularUserToken}`)
            .send(newAdmin);

        expect(registerRes.status).toBe(403);  // Forbidden error
        expect(registerRes.body.message).toBe("Only admins can create admin accounts");
    });
});
