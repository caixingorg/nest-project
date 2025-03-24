import { SetMetadata } from '@nestjs/common';

/**
 * 公共路由装饰器常量
 * - 用于标记不需要 JWT 认证的路由
 * - 配合 JwtAuthGuard 守卫使用
 */
export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公共路由装饰器
 * @returns 自定义元数据装饰器
 *
 * 使用方式：
 * @Public()
 * @Get('public-route')
 * publicRouteHandler() { ... }
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
