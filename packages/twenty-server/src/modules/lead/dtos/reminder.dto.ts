import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

export enum ReminderTypeEnum {
  BIRTHDAY = 'BIRTHDAY',
  LOAN_TOPUP = 'LOAN_TOPUP',
  FOLLOW_UP = 'FOLLOW_UP',
  CUSTOM = 'CUSTOM',
}

registerEnumType(ReminderTypeEnum, {
  name: 'ReminderType',
  description: 'The type of reminder',
});

@ObjectType('Reminder')
export class ReminderDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => ReminderTypeEnum)
  type: ReminderTypeEnum;

  @Field(() => UUIDScalarType)
  leadId: string;

  @Field(() => String)
  title: string;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => Date)
  dueDate: Date;

  @Field(() => Boolean)
  isCompleted: boolean;

  @Field(() => Date)
  createdAt: Date;
}
