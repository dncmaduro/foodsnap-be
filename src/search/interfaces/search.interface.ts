export interface Restaurant {
  restaurant_id: string;
  user_id: string;
  restaurantapp_id: string;
  name: string;
  description: string;
  district: string;
  address: string;
  phone: string;
  rating: number;
  open_time: string;
  close_time: string;
  approved_at: Date;
  image_url: string;
}

export interface Menuitem {
  menuitem_id: string;
  restaurant_id: string;
  name: string;
  description: string;
  price: number;
  image_url: string;
  created_at: Date;
  active: boolean;
}
