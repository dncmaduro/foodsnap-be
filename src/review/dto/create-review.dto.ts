// create-review.dto.ts
import { IsInt, IsString, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ example: 123, description: 'ID của đơn hàng' })
  @IsInt()
  order_id: number;

  @ApiProperty({ example: 5, description: 'Số sao đánh giá (1-5)' })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({
    example: 'Món ăn rất ngon, giao hàng nhanh.',
    description: 'Nội dung đánh giá',
    required: false,
  })
  @IsString()
  @IsOptional()
  comment?: string;
}
