import 'dotenv/config';
import passport from 'passport';
import GoogleStrategy from 'passport-google-oauth20';
import FacebookStrategy from 'passport-facebook';
import AppleStrategy from 'passport-apple';
import { findOrCreateUser } from '../services/authService.js';
import { logger } from './logger.js';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/api/auth/google/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'google',
      providerId: profile.id,
    });
    done(null, user);
  } catch (error) {
    logger.error('Google auth error:', error);
    done(error);
  }
}));

passport.use(new FacebookStrategy({
  clientID: process.env.FACEBOOK_CLIENT_ID,
  clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
  callbackURL: '/api/auth/facebook/callback',
  profileFields: ['id', 'emails', 'displayName'],
}, async (accessToken, refreshToken, profile, done) => {
  try {
    const user = await findOrCreateUser({
      email: profile.emails[0].value,
      name: profile.displayName,
      provider: 'facebook',
      providerId: profile.id,
    });
    done(null, user);
  } catch (error) {
    logger.error('Facebook auth error:', error);
    done(error);
  }
}));

passport.use(new AppleStrategy({
  clientID: process.env.APPLE_CLIENT_ID,
  teamID: process.env.APPLE_TEAM_ID,
  keyID: process.env.APPLE_KEY_ID,
  privateKey: process.env.APPLE_PRIVATE_KEY,
  callbackURL: '/api/auth/apple/callback',
}, async (accessToken, refreshToken, idToken, profile, done) => {
  try {
    const user = await findOrCreateUser({
      email: idToken.email,
      name: idToken.name || 'Apple User',
      provider: 'apple',
      providerId: idToken.sub,
    });
    done(null, user);
  } catch (error) {
    logger.error('Apple auth error:', error);
    done(error);
  }
}));