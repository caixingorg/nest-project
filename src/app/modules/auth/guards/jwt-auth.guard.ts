import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

/**
 * JWT 认证守卫
 * 1. 继承自 passport 的 AuthGuard('jwt')
 * 2. 结合 Public 装饰器实现路由访问控制
 * 3. 处理 JWT 认证逻辑和异常处理
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  /**
   * 路由激活控制方法
   * @param context 执行上下文
   * @returns 认证结果 Promise<boolean>
   *
   * 实现逻辑：
   * 1. 使用 Reflector 检查路由是否标记为公开
   * 2. 公开路由直接放行
   * 3. 非公开路由执行 JWT 认证
   */
  canActivate(context: ExecutionContext) {
    // 通过反射器获取路由元数据中的 Public 装饰器标记
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(), // 方法级别元数据
      context.getClass(), // 类级别元数据
    ]);

    if (isPublic) {
      return true; // 放行公开路由
    }

    // 执行父类 JWT 认证逻辑
    return super.canActivate(context);
  }

  /**
   * 处理认证请求结果
   * @param err 认证错误对象
   * @param user 认证用户信息
   * @param info 认证附加信息
   * @returns 用户信息
   * @throws UnauthorizedException 认证失败时抛出
   *
   * 实现逻辑：
   * 1. 处理认证过程中可能出现的错误
   * 2. 当认证失败时抛出统一异常
   * 3. 认证成功时返回用户信息
   */
  handleRequest(err: any, user: any, info: any) {
    if (err || !user) {
      // 统一处理认证失败情况
      throw err || new UnauthorizedException('errors.unauthorized');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return user; // 返回用户信息到请求上下文
  }
}
