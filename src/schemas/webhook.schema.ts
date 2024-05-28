import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Webhook extends Document {
  @Prop({ type: Object, required: true })
  data: any;

  @Prop({ type: Date, default: Date.now })
  createdAt: Date;
}

export const WebhookSchema = SchemaFactory.createForClass(Webhook);
