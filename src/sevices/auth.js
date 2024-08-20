import handlebars from 'handlebars';
import path from 'node:path';
import fs from 'node:fs/promises';
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import jwt from 'jsonwebtoken';
import { UsersCollection } from "../db/modells/user.js";
import createHttpError from 'http-errors';
import { SessionsCollection } from '../db/modells/session.js';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL, SMTP, TEMPLATES_DIR } from '../constants/index.js';
import { sendEmail } from '../utils/sendMail.js';

export const registerUser = async (payload) => {
    const user = await UsersCollection.findOne({
        email: payload.email,
    });
    if (user) throw createHttpError(409, 'Email in use');

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    return await UsersCollection.create({
        ...payload,
        password: encryptedPassword,
    });
};

export const loginUser = async (payload) => {
    const user = await UsersCollection.findOne({
        email: payload.email,
    });
    if (!user) throw createHttpError(409, 'User not found');

    const isEqual = await bcrypt.compare(payload.password, user.password);

    if (!isEqual) throw createHttpError(401, 'Unauthorized');

    await SessionsCollection.deleteOne({ userId: user._id });

    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');


    return await SessionsCollection.create({
        userId: user._id,
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TTL),
        refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TTL),
    });
};

const createSessoin = () => {
    const accessToken = randomBytes(30).toString('base64');
    const refreshToken = randomBytes(30).toString('base64');

    return {
        accessToken,
        refreshToken,
        accessTokenValidUntil: new Date(Date.now() + ACCESS_TOKEN_TTL),
        refreshTokenValidUntil: new Date(Date.now() + REFRESH_TOKEN_TTL),
    };
};

export const refreshUsersSession = async ({sessionId, refreshToken}) => {
    const session = await SessionsCollection.findOne({
        _id: sessionId,
        refreshToken
    });

    if (!session) {
        throw createHttpError(401, 'Session not found');
    }

    const isSessionTokenExpired = new Date() > new Date(session.refreshTokenValidUntil);

    if (isSessionTokenExpired) {
        throw createHttpError(401, 'Session token expired');
    }

    const newSession = createSessoin();

    await SessionsCollection.deleteOne({ _id: sessionId, refreshToken });

    return await SessionsCollection.create({
        userId: session.userId,
        ...newSession,
    });
};

export const logoutUser = async (sessionId) => {
    await SessionsCollection.deleteOne({ _id: sessionId });
};

export const requestResetToken = async (email) => {
    const user = await UsersCollection.findOne({ email });
    if (!user) {
        throw createHttpError(404, 'User not found');
    }

    const resetToken = jwt.sign({
        sub: user._id,
        email,
    },
        process.env.JWT_SECRET,
        {expiresIn:'15m'},
    );

    const resetPasswordTemplatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');

    const templateSource = (
        await fs.readFile(resetPasswordTemplatePath)
    ).toString();

    const template = handlebars.compile(templateSource);

    const html = template({
        name: user.name,
        link: `${process.env.APP_DOMAIN}/reset-password?token=${resetToken}`
    });


    await sendEmail({
        from: SMTP.SMTP_FROM,
        to: email,
        subject: 'Reset your password',
        html,
    });
};

export const resetPassword = async (payload) => {
    let entries;

    try {
        entries = jwt.verify(payload.token, process.env.JWT_SECRET);
    } catch (err) {
        if (err instanceof Error) throw createHttpError(401, err.message);
        throw err;
    }

    const user = await UsersCollection.findOne({
        email: entries.email,
        _id: entries.sub,
    });

    if (!user) throw createHttpError(404, 'User not found');

    const encryptedPassword = await bcrypt.hash(payload.password, 10);

    await UsersCollection.updateOne(
        { _id: user._id },
        { password: encryptedPassword },
    );

};
