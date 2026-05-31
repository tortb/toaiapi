/**
 * 分页请求 DTO
 *
 * @example
 * GET /api/v1/users?page=1&pageSize=20
 */
export declare class PaginationDto {
    readonly page: number;
    readonly pageSize: number;
}
/**
 * 分页响应数据
 */
export interface PaginatedResult<T> {
    readonly items: T[];
    readonly total: number;
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
}
//# sourceMappingURL=pagination.dto.d.ts.map