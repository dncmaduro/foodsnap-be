import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { SearchModule } from './search/search.module';
import { JwtStrategy } from './auth/strategies/jwt.strategy';
import { RestaurantModule } from './restaurant/restaurant.module';
import { CartModule } from './cart/cart.module';
import { AddressModule } from './address/address.module';
import { OrderModule } from './order/order.module';
import { ReviewModule } from './review/review.module';
import { RestaurantApplicationModule } from './restaurant-application/restaurant-application.module';
import { ShipperApplicationModule } from './shipper-application/shipper-application.module';
import { ShipperInfoModule } from './shipper/shipper.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    SupabaseModule,
    AuthModule,
    SearchModule,
    RestaurantModule,
    CartModule,
    AddressModule,
    OrderModule,
    ReviewModule,
    RestaurantApplicationModule,
    ShipperApplicationModule,
    ShipperInfoModule,
  ],
  controllers: [AppController],
  providers: [AppService, JwtStrategy],
})
export class AppModule {}
