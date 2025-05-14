import { ApiProperty } from '@nestjs/swagger';

export class SearchDto {
  @ApiProperty({
    description: 'Từ khóa tìm kiếm',
    example: 'bún đậu mắm tôm',
    required: true,
  })
  query: string;

  @ApiProperty({
    description: 'Loại tìm kiếm',
    example: 'recipe',
    required: false,
  })
  type?: string;
}
