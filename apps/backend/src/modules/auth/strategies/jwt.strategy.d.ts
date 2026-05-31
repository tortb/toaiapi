import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
/**
 * JWT 策略
 *
 * 从 Authorization 头中提取 Bearer Token，验证 JWT 签名和有效期。
 * 验证通过后返回用户信息，附加到 request.user。
 */
export declare class JwtStrategy extends JwtStrategy_base {
    private readonly configService;
    private readonly userService;
    constructor(configService: ConfigService, userService: UserService);
    /**
     * 验证 JWT payload
     *
     * @param payload - 解码后的 JWT payload
     * @returns 用户信息
     */
    validate(payload: {
        sub: string;
        email: string;
        role: string;
    }): Promise<{
        id: string;
        email: string;
        role: string;
    }>;
}
export {};
//# sourceMappingURL=jwt.strategy.d.ts.map