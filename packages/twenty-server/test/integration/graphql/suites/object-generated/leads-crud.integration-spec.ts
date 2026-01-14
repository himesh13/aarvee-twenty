import gql from 'graphql-tag';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { findManyOperationFactory } from 'test/integration/graphql/utils/find-many-operation-factory.util';
import { findOneOperationFactory } from 'test/integration/graphql/utils/find-one-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

// Define GraphQL fields to query for Lead entities
const LEAD_GQL_FIELDS = `
  id
  leadNo
  customerName
  contactNumber {
    primaryPhoneNumber
    primaryPhoneCountryCode
    primaryPhoneCallingCode
  }
  loanAmount
  locationText
  locationLat
  locationLng
  referredBy
  shortDescription
  status
  product
  position
  createdAt
  updatedAt
`;

const CATALOG_PRODUCT_GQL_FIELDS = `
  id
  name
  isActive
  position
  createdAt
`;

const CATALOG_STATUS_GQL_FIELDS = `
  id
  name
  isActive
  position
  createdAt
`;

const PROPERTY_GQL_FIELDS = `
  id
  propertyType
  address
  city
  state
  pincode
  area
  marketValue
  createdAt
`;

describe('leads CRUD operations (integration)', () => {
  let createdLeadId: string;
  let secondLeadId: string;

  beforeAll(async () => {
    // Clean up before tests to ensure clean state
    await deleteAllRecords('lead');
    await deleteAllRecords('property');
    await deleteAllRecords('catalogProduct');
    await deleteAllRecords('catalogStatus');
  });

  describe('Create operations', () => {
    it('should create a single lead', async () => {
      const graphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'lead',
        objectMetadataPluralName: 'leads',
        gqlFields: LEAD_GQL_FIELDS,
        data: [
          {
            leadNo: 'LD-202601-00001',
            customerName: 'John Doe',
            contactNumber: {
              primaryPhoneCountryCode: '+1',
              primaryPhoneNumber: '5551234567',
              primaryPhoneCallingCode: '+1',
            },
            loanAmount: 250000,
            locationText: 'San Francisco, CA',
            shortDescription: 'Home loan application for primary residence',
          },
        ],
        upsert: false,
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createLeads).toHaveLength(1);
      expect(response.body.data.createLeads[0].leadNo).toEqual(
        'LD-202601-00001',
      );
      expect(response.body.data.createLeads[0].customerName).toEqual(
        'John Doe',
      );
      expect(response.body.data.createLeads[0].loanAmount).toEqual(250000);
      expect(
        response.body.data.createLeads[0].contactNumber.primaryPhoneNumber,
      ).toEqual('5551234567');

      // Save ID for subsequent tests
      createdLeadId = response.body.data.createLeads[0].id;
    });

    it('should create multiple leads', async () => {
      const graphqlOperation = createManyOperationFactory({
        objectMetadataSingularName: 'lead',
        objectMetadataPluralName: 'leads',
        gqlFields: LEAD_GQL_FIELDS,
        data: [
          {
            leadNo: 'LD-202601-00002',
            customerName: 'Jane Smith',
            contactNumber: {
              primaryPhoneCountryCode: '+1',
              primaryPhoneNumber: '5559876543',
              primaryPhoneCallingCode: '+1',
            },
            loanAmount: 350000,
            locationText: 'Los Angeles, CA',
            shortDescription: 'Auto loan for new vehicle',
          },
          {
            leadNo: 'LD-202601-00003',
            customerName: 'Bob Johnson',
            contactNumber: {
              primaryPhoneCountryCode: '+1',
              primaryPhoneNumber: '5551112222',
              primaryPhoneCallingCode: '+1',
            },
            loanAmount: 150000,
            locationText: 'Seattle, WA',
            shortDescription: 'Personal loan for debt consolidation',
          },
        ],
        upsert: false,
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createLeads).toHaveLength(2);
      expect(response.body.data.createLeads[0].customerName).toEqual(
        'Jane Smith',
      );
      expect(response.body.data.createLeads[1].customerName).toEqual(
        'Bob Johnson',
      );

      // Save second lead ID
      secondLeadId = response.body.data.createLeads[0].id;
    });
  });

  describe('Read operations', () => {
    it('should find one lead by ID', async () => {
      const graphqlOperation = findOneOperationFactory({
        objectMetadataSingularName: 'lead',
        gqlFields: LEAD_GQL_FIELDS,
        filter: {
          id: {
            eq: createdLeadId,
          },
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.lead).toBeDefined();
      expect(response.body.data.lead.id).toEqual(createdLeadId);
      expect(response.body.data.lead.customerName).toEqual('John Doe');
    });

    it('should find all leads', async () => {
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'lead',
        objectMetadataPluralName: 'leads',
        gqlFields: LEAD_GQL_FIELDS,
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.leads.edges.length).toBeGreaterThanOrEqual(3);
    });

    it('should filter leads by loan amount', async () => {
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'lead',
        objectMetadataPluralName: 'leads',
        gqlFields: LEAD_GQL_FIELDS,
        filter: {
          loanAmount: {
            gte: 200000,
          },
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.leads.edges.length).toBeGreaterThan(0);

      // Verify all returned leads have loan amount >= 200000
      response.body.data.leads.edges.forEach((edge: any) => {
        expect(edge.node.loanAmount).toBeGreaterThanOrEqual(200000);
      });
    });

    it('should search leads by customer name', async () => {
      const graphqlOperation = findManyOperationFactory({
        objectMetadataSingularName: 'lead',
        objectMetadataPluralName: 'leads',
        gqlFields: LEAD_GQL_FIELDS,
        filter: {
          customerName: {
            like: '%John%',
          },
        },
      });

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.leads.edges.length).toBeGreaterThan(0);

      // Verify all returned leads have "John" in customer name
      response.body.data.leads.edges.forEach((edge: any) => {
        expect(edge.node.customerName).toContain('John');
      });
    });
  });

  describe('Update operations', () => {
    it('should update a lead', async () => {
      const updateOperation = {
        query: gql`
          mutation UpdateLead($id: ID!, $data: LeadUpdateInput!) {
            updateLead(id: $id, data: $data) {
              ${LEAD_GQL_FIELDS}
            }
          }
        `,
        variables: {
          id: createdLeadId,
          data: {
            customerName: 'John Doe Updated',
            loanAmount: 275000,
            status: 'In Progress',
          },
        },
      };

      const response = await makeGraphqlAPIRequest(updateOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateLead.id).toEqual(createdLeadId);
      expect(response.body.data.updateLead.customerName).toEqual(
        'John Doe Updated',
      );
      expect(response.body.data.updateLead.loanAmount).toEqual(275000);
      expect(response.body.data.updateLead.status).toEqual('In Progress');
    });

    it('should update multiple fields at once', async () => {
      const updateOperation = {
        query: gql`
          mutation UpdateLead($id: ID!, $data: LeadUpdateInput!) {
            updateLead(id: $id, data: $data) {
              ${LEAD_GQL_FIELDS}
            }
          }
        `,
        variables: {
          id: secondLeadId,
          data: {
            locationText: 'Updated Location, CA',
            locationLat: 37.7749,
            locationLng: -122.4194,
            referredBy: 'Agent Smith',
          },
        },
      };

      const response = await makeGraphqlAPIRequest(updateOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.updateLead.locationText).toEqual(
        'Updated Location, CA',
      );
      expect(response.body.data.updateLead.locationLat).toEqual(37.7749);
      expect(response.body.data.updateLead.locationLng).toEqual(-122.4194);
      expect(response.body.data.updateLead.referredBy).toEqual('Agent Smith');
    });
  });

  describe('Delete operations', () => {
    it('should soft delete a lead', async () => {
      const deleteOperation = {
        query: gql`
          mutation DeleteLead($id: ID!) {
            deleteLead(id: $id) {
              id
              deletedAt
            }
          }
        `,
        variables: {
          id: secondLeadId,
        },
      };

      const response = await makeGraphqlAPIRequest(deleteOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.deleteLead.id).toEqual(secondLeadId);
      expect(response.body.data.deleteLead.deletedAt).toBeDefined();
      expect(response.body.data.deleteLead.deletedAt).not.toBeNull();
    });

    it('should restore a deleted lead', async () => {
      const restoreOperation = {
        query: gql`
          mutation RestoreLead($id: ID!) {
            restoreLead(id: $id) {
              id
              deletedAt
            }
          }
        `,
        variables: {
          id: secondLeadId,
        },
      };

      const response = await makeGraphqlAPIRequest(restoreOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.restoreLead.id).toEqual(secondLeadId);
      expect(response.body.data.restoreLead.deletedAt).toBeNull();
    });
  });
});

describe('catalog entities (integration)', () => {
  let productId: string;
  let statusId: string;

  beforeAll(async () => {
    await deleteAllRecords('catalogProduct');
    await deleteAllRecords('catalogStatus');
  });

  it('should create catalog products', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'catalogProduct',
      objectMetadataPluralName: 'catalogProducts',
      gqlFields: CATALOG_PRODUCT_GQL_FIELDS,
      data: [
        { name: 'Home Loan', isActive: true, position: 1 },
        { name: 'Auto Loan', isActive: true, position: 2 },
        { name: 'Personal Loan', isActive: true, position: 3 },
      ],
      upsert: false,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createCatalogProducts).toHaveLength(3);
    expect(response.body.data.createCatalogProducts[0].name).toEqual(
      'Home Loan',
    );
    expect(response.body.data.createCatalogProducts[0].isActive).toBe(true);

    productId = response.body.data.createCatalogProducts[0].id;
  });

  it('should create catalog statuses', async () => {
    const graphqlOperation = createManyOperationFactory({
      objectMetadataSingularName: 'catalogStatus',
      objectMetadataPluralName: 'catalogStatuses',
      gqlFields: CATALOG_STATUS_GQL_FIELDS,
      data: [
        { name: 'New', isActive: true, position: 1 },
        { name: 'In Progress', isActive: true, position: 2 },
        { name: 'Approved', isActive: true, position: 3 },
        { name: 'Rejected', isActive: true, position: 4 },
      ],
      upsert: false,
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createCatalogStatuses).toHaveLength(4);
    expect(response.body.data.createCatalogStatuses[0].name).toEqual('New');

    statusId = response.body.data.createCatalogStatuses[0].id;
  });

  it('should query catalog products', async () => {
    const graphqlOperation = findManyOperationFactory({
      objectMetadataSingularName: 'catalogProduct',
      objectMetadataPluralName: 'catalogProducts',
      gqlFields: CATALOG_PRODUCT_GQL_FIELDS,
      filter: {
        isActive: {
          eq: true,
        },
      },
    });

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.catalogProducts.edges.length).toEqual(3);

    // All should be active
    response.body.data.catalogProducts.edges.forEach((edge: any) => {
      expect(edge.node.isActive).toBe(true);
    });
  });

  it('should update catalog product', async () => {
    const updateOperation = {
      query: gql`
        mutation UpdateCatalogProduct($id: ID!, $data: CatalogProductUpdateInput!) {
          updateCatalogProduct(id: $id, data: $data) {
            ${CATALOG_PRODUCT_GQL_FIELDS}
          }
        }
      `,
      variables: {
        id: productId,
        data: {
          name: 'Home Loan - Updated',
          isActive: false,
        },
      },
    };

    const response = await makeGraphqlAPIRequest(updateOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.updateCatalogProduct.name).toEqual(
      'Home Loan - Updated',
    );
    expect(response.body.data.updateCatalogProduct.isActive).toBe(false);
  });
});

describe('lead child entities (integration)', () => {
  let leadId: string;
  let propertyId: string;

  beforeAll(async () => {
    // Create a lead for testing child entities
    await deleteAllRecords('lead');
    await deleteAllRecords('property');

    const leadOperation = createManyOperationFactory({
      objectMetadataSingularName: 'lead',
      objectMetadataPluralName: 'leads',
      gqlFields: LEAD_GQL_FIELDS,
      data: [
        {
          leadNo: 'LD-202601-99999',
          customerName: 'Test Customer for Relations',
          contactNumber: {
            primaryPhoneCountryCode: '+1',
            primaryPhoneNumber: '5559999999',
            primaryPhoneCallingCode: '+1',
          },
          loanAmount: 400000,
        },
      ],
    });

    const leadResponse = await makeGraphqlAPIRequest(leadOperation);
    leadId = leadResponse.body.data.createLeads[0].id;
  });

  it('should create property linked to lead', async () => {
    const propertyOperation = createManyOperationFactory({
      objectMetadataSingularName: 'property',
      objectMetadataPluralName: 'properties',
      gqlFields: PROPERTY_GQL_FIELDS,
      data: [
        {
          leadId: leadId,
          propertyType: 'Residential',
          address: '123 Test Street',
          city: 'Test City',
          state: 'CA',
          pincode: '94102',
          area: 2000,
          marketValue: 600000,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(propertyOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createProperties).toHaveLength(1);
    expect(response.body.data.createProperties[0].propertyType).toEqual(
      'Residential',
    );
    expect(response.body.data.createProperties[0].address).toEqual(
      '123 Test Street',
    );

    propertyId = response.body.data.createProperties[0].id;
  });

  it('should query lead with properties', async () => {
    const LEAD_WITH_PROPERTIES_GQL = `
      id
      customerName
      properties {
        edges {
          node {
            ${PROPERTY_GQL_FIELDS}
          }
        }
      }
    `;

    const graphqlOperation = {
      query: gql`
        query GetLeadWithProperties($filter: LeadFilterInput!) {
          lead(filter: $filter) {
            ${LEAD_WITH_PROPERTIES_GQL}
          }
        }
      `,
      variables: {
        filter: {
          id: { eq: leadId },
        },
      },
    };

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.lead).toBeDefined();
    expect(response.body.data.lead.properties.edges.length).toBeGreaterThan(0);
    expect(response.body.data.lead.properties.edges[0].node.id).toEqual(
      propertyId,
    );
    expect(
      response.body.data.lead.properties.edges[0].node.propertyType,
    ).toEqual('Residential');
  });

  it('should create multiple properties for the same lead', async () => {
    const propertyOperation = createManyOperationFactory({
      objectMetadataSingularName: 'property',
      objectMetadataPluralName: 'properties',
      gqlFields: PROPERTY_GQL_FIELDS,
      data: [
        {
          leadId: leadId,
          propertyType: 'Commercial',
          address: '456 Business Ave',
          city: 'Test City',
          state: 'CA',
          pincode: '94103',
          area: 5000,
          marketValue: 1200000,
        },
        {
          leadId: leadId,
          propertyType: 'Land',
          address: '789 Plot Road',
          city: 'Test City',
          state: 'CA',
          pincode: '94104',
          area: 10000,
          marketValue: 800000,
        },
      ],
    });

    const response = await makeGraphqlAPIRequest(propertyOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.createProperties).toHaveLength(2);
  });

  it('should query lead with multiple properties', async () => {
    const LEAD_WITH_PROPERTIES_GQL = `
      id
      customerName
      loanAmount
      properties {
        edges {
          node {
            ${PROPERTY_GQL_FIELDS}
          }
        }
      }
    `;

    const graphqlOperation = {
      query: gql`
        query GetLeadWithAllProperties($filter: LeadFilterInput!) {
          lead(filter: $filter) {
            ${LEAD_WITH_PROPERTIES_GQL}
          }
        }
      `,
      variables: {
        filter: {
          id: { eq: leadId },
        },
      },
    };

    const response = await makeGraphqlAPIRequest(graphqlOperation);

    expect(response.body.errors).toBeUndefined();
    expect(response.body.data.lead.properties.edges.length).toEqual(3);

    // Verify all property types are present
    const propertyTypes = response.body.data.lead.properties.edges.map(
      (edge: any) => edge.node.propertyType,
    );
    expect(propertyTypes).toContain('Residential');
    expect(propertyTypes).toContain('Commercial');
    expect(propertyTypes).toContain('Land');
  });
});
