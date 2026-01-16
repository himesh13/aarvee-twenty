import { Field, ObjectType } from '@nestjs/graphql';

import { UUIDScalarType } from 'src/engine/api/graphql/workspace-schema-builder/graphql-types/scalars';

@ObjectType('DuplicatedLead')
export class DuplicatedLeadDTO {
  @Field(() => UUIDScalarType)
  id: string;

  @Field(() => String)
  leadNo: string;

  @Field(() => String, { nullable: true })
  customerName: string | null;

  @Field(() => String, { nullable: true })
  contactNumber: string | null;

  @Field(() => String)
  createdAt: string;

  @Field(() => String)
  updatedAt: string;
}
