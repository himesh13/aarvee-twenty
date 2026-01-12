import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class CatalogFinancerWorkspaceEntity extends BaseWorkspaceEntity {
  name: string;
  isActive: boolean;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
}
