/**
 * @jest-environment node
 */

import { POST as RegisterTest } from '@/app/api/auth/register/route';
import { POST as LoginTest } from '@/app/api/auth/login/route';
import { userRepository } from '@/data/Repository';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { hashPassword, verifyPassword } from '@/lib/passwords';
import { createSession } from '@/lib/session';

jest.mock('@/data/Repository', () => ({
    userRepository: {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        findOneBy: jest.fn(),
    }
}));

jest.mock("@/lib/passwords", () => ({
    hashPassword: jest.fn(),
    verifyPassword: jest.fn(),
}));

jest.mock('@/lib/session', () => ({
    createSession: jest.fn(),
}));

const mockUser = {
    email: 'test@test.com',
    password: 'test1234',
    name: 'test',
    id: 1,
}

describe('Registration Endpoints test', () => {
    let req: NextRequest;
    let res: NextResponse;
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('user can register', async () => {
        (userRepository.create as jest.Mock).mockReturnValue(mockUser);
        (userRepository.save as jest.Mock).mockResolvedValue(mockUser);
        (userRepository.findOne as jest.Mock).mockResolvedValue(null);
        (hashPassword as jest.Mock).mockResolvedValue(mockUser.password);

        const registerBody = {
            fullname: mockUser.name,
            email: mockUser.email,
            password: mockUser.password,
            confirmPassword: mockUser.password,
        }


        req = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerBody),
        });

        const response = await RegisterTest(req);
        expect(response.status).toBe(201);
        expect(await response.json()).toEqual({
           data: {
            message: 'User created successfully',
           },
           error: null,
           success: true,
        });
        expect(userRepository.create).toHaveBeenCalledWith({
            name: mockUser.name,
            email: mockUser.email,
            password: mockUser.password,
        });
        expect(userRepository.save).toHaveBeenCalled();
    });

    it('user cannot register with invalid data', async () => {
        req = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({}),
        });
        // empty body
        const emptyBodyResponse = await RegisterTest(req);
        expect(emptyBodyResponse.status).toBe(422);
        expect(await emptyBodyResponse.json()).toEqual({
            data: null,
            error: {
                fullname: 'Required',
                email: 'Required',
                password: 'Required',
                confirmPassword: 'Required',
                root: null
            },
            success: false,
        });

        // invalid email
        req = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                fullname: mockUser.name,
                email: 'invalid-email',
                password: mockUser.password,
                confirmPassword: mockUser.password,
            }),
        });

        const invalidEmailResponse = await RegisterTest(req);
        expect(invalidEmailResponse.status).toBe(422);
        expect(await invalidEmailResponse.json()).toEqual({
            data: null,
            error: {
                email: 'Invalid email',
                root: null
            },
            success: false,
        });

        // password mismatch
        req = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                fullname: mockUser.name,
                email: mockUser.email,
                password: mockUser.password,
                confirmPassword: 'mismatch',
            }),
        });

        const passwordMismatchResponse = await RegisterTest(req);
        expect(passwordMismatchResponse.status).toBe(422);
        expect(await passwordMismatchResponse.json()).toEqual({
            data: null,
            error: {
                confirmPassword: 'Passwords do not match',
                root: null
            },
            success: false,
        });

        // password too short
        req = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({
                fullname: mockUser.name,
                email: mockUser.email,
                password: '12345',
                confirmPassword: '12345',
            }),
        });

        const passwordTooShortResponse = await RegisterTest(req);
        expect(passwordTooShortResponse.status).toBe(422);
        expect(await passwordTooShortResponse.json()).toEqual({
            data: null,
            error: {
                password: 'Password must be at least 8 characters long',
                confirmPassword: 'Password must be at least 8 characters long',
                root: null
            },
            success: false,
        });
    });

    it('user cannot register with existing email', async () => {
        (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);
        (hashPassword as jest.Mock).mockResolvedValue(mockUser.password);

        const registerBody = {
            fullname: mockUser.name,
            email: mockUser.email,
            password: mockUser.password,
            confirmPassword: mockUser.password,
        }

        req = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerBody),
        });

        const response = await RegisterTest(req);
        expect(response.status).toBe(422);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'User already exists' },
            success: false,
        });
    });

    it('generic error reporting', async() => {
        (userRepository.findOne as jest.Mock).mockRejectedValue(new Error('Database error'));
        (hashPassword as jest.Mock).mockResolvedValue(mockUser.password);

        const registerBody = {
            fullname: mockUser.name,
            email: mockUser.email,
            password: mockUser.password,
            confirmPassword: mockUser.password,
        }

        req = new NextRequest('http://localhost:3000/api/auth/register', {
            method: 'POST',
            body: JSON.stringify(registerBody),
        });

        const response = await RegisterTest(req);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Server error, please try again later' },
            success: false,
        });
    });
});


describe('Login Endpoints test', () => {
    let req: NextRequest;
    let res: NextResponse;
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('user can login', async () => {
        (userRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
        (verifyPassword as jest.Mock).mockResolvedValue(true);
        (createSession as jest.Mock).mockResolvedValue(null);

        const loginBody = {
            email: mockUser.email,
            password: mockUser.password,
        }

        req = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginBody),
        });

        const response = await LoginTest(req);
        expect(response.status).toBe(200);
        expect(await response.json()).toEqual({
            data: {
                    user: {id: mockUser.id,
                    name: mockUser.name,
                    email: mockUser.email,}
            },
            error: null,
            success: true,
        });
    });

    it('user cannot login with invalid data', async () => {
        req = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({}),
        });

        const response = await LoginTest(req);
        expect(response.status).toBe(422);
        expect(await response.json()).toEqual({
            data: null,
            error: { email: 'Required', password: 'Required', root: null },
            success: false,
        });

        // invalid email
        req = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: 'invalid-email',
                password: mockUser.password,
            }),
        });

        const invalidEmailResponse = await LoginTest(req);
        expect(invalidEmailResponse.status).toBe(422);
        expect(await invalidEmailResponse.json()).toEqual({
            data: null,
            error: { email: 'Invalid email', root: null },
            success: false,
        });

        // invalid password
        req = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({
                email: mockUser.email,
                password: 'in',
            }),
        });

        const invalidPasswordResponse = await LoginTest(req);
        expect(invalidPasswordResponse.status).toBe(422);
        expect(await invalidPasswordResponse.json()).toEqual({
            data: null,
            error: { password: 'Password must be at least 8 characters long', root: null },
            success: false,
        });
    });

    it('user cannot login with invalid password', async () => {
        (userRepository.findOneBy as jest.Mock).mockResolvedValue(mockUser);
        (verifyPassword as jest.Mock).mockResolvedValue(false);

        const loginBody = {
            email: mockUser.email,
            password: mockUser.password,
        }

        req = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginBody),
        });
        
        const response = await LoginTest(req);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Invalid username or password' },
            success: false,
        });
    });

    it('user cannot login with invalid email', async () => {
        (userRepository.findOneBy as jest.Mock).mockResolvedValue(null);

        const loginBody = {
            email: mockUser.email,
            password: mockUser.password,
        }
       
        req = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginBody),
        });

        const response = await LoginTest(req);
        expect(response.status).toBe(401);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Invalid username or password' },
            success: false,
        });
    });

    it('generic error reporting', async () => {
        (userRepository.findOneBy as jest.Mock).mockRejectedValue(new Error('Database error'));

        const loginBody = {
            email: mockUser.email,
            password: mockUser.password,
        }
       
        req = new NextRequest('http://localhost:3000/api/auth/login', {
            method: 'POST',
            body: JSON.stringify(loginBody),
        });

        const response = await LoginTest(req);
        expect(response.status).toBe(500);
        expect(await response.json()).toEqual({
            data: null,
            error: { root: 'Server error, please try again later' },
            success: false,
        });
    });
});