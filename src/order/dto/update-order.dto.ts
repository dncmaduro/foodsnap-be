import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum ShipperOrderStatus {
  InTransit = 'In Transit',
  Delivered = 'Delivered',
  Canceled = 'Canceled By Shipper',
}

export class UpdateShippingStatusDto {
  @ApiProperty({
    enum: ShipperOrderStatus,
    description: 'Trạng thái mới của đơn hàng',
    example: ShipperOrderStatus.InTransit,
  })
  @IsEnum(ShipperOrderStatus, { message: 'Trạng thái không hợp lệ' })
  status: ShipperOrderStatus;
}
