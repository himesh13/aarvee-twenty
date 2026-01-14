import { Module } from '@nestjs/common';

/**
 * Lead Module
 * 
 * Provides functionality for managing leads in the Lead Management System.
 * This module is designed to work with Twenty's metadata-driven architecture,
 * where CRUD operations are auto-generated from workspace entities.
 * 
 * The workspace entities are automatically discovered and registered by the
 * metadata system, so they don't need to be imported here.
 * 
 * Business logic services (like lead number generation) should be implemented
 * as custom resolvers or mutations in the GraphQL API layer once the basic
 * metadata system is working.
 */
@Module({
  imports: [],
  providers: [],
  exports: [],
})
export class LeadModule {}
