import { PaginationQueryDto } from '../dto/pagination-query.dto';

export const getPaginationOptions = (query: PaginationQueryDto) => {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const skip = (page - 1) * limit;
  return { skip, take: limit, page, limit };
};
