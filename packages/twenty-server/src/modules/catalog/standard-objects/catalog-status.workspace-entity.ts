import { type ActorMetadata } from 'twenty-shared/types';

import { BaseWorkspaceEntity } from 'src/engine/twenty-orm/base.workspace-entity';

export class CatalogStatusWorkspaceEntity extends BaseWorkspaceEntity {
  // Catalog fields
  name: string;
  isActive: boolean;
  position: number;
  createdBy: ActorMetadata;
  updatedBy: ActorMetadata;
}
