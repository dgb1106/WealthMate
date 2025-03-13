// back_end/src/auth/jwt.strategy.ts
import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      throw new Error('JWT_SECRET is not defined in the environment variables');
    }
    
    super({
      jwtFromRequest: (req) => {
        // Lấy từ header TRƯỚC
        const tokenFromHeader = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
        if (tokenFromHeader) {
          return tokenFromHeader;
        }
        // Nếu không có header thì lấy từ cookie
        if (req && req.cookies) {
          return req.cookies['auth_token'];
        }
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: jwtSecret,
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);
    return { userId: payload.sub, email: payload.email };
  }
}