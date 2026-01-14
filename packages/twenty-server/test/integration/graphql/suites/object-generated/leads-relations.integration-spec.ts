import gql from 'graphql-tag';

import { createManyOperationFactory } from 'test/integration/graphql/utils/create-many-operation-factory.util';
import { makeGraphqlAPIRequest } from 'test/integration/graphql/utils/make-graphql-api-request.util';
import { deleteAllRecords } from 'test/integration/utils/delete-all-records';

const LEAD_GQL_FIELDS = `
  id
  leadNo
  customerName
  contactNumber {
    primaryPhoneNumber
    primaryPhoneCountryCode
  }
  loanAmount
`;

const ATTACHMENT_GQL_FIELDS = `
  id
  name
  fullPath
  type
  lead {
    id
    customerName
  }
`;

const TASK_GQL_FIELDS = `
  id
  title
  body
  status
`;

const TASK_TARGET_GQL_FIELDS = `
  id
  task {
    id
    title
    status
  }
  lead {
    id
    customerName
  }
`;

const NOTE_GQL_FIELDS = `
  id
  title
  body
`;

const NOTE_TARGET_GQL_FIELDS = `
  id
  note {
    id
    title
  }
  lead {
    id
    customerName
  }
`;

const FAVORITE_GQL_FIELDS = `
  id
  position
  lead {
    id
    customerName
  }
`;

describe('lead relations with existing Twenty entities (integration)', () => {
  let leadId: string;
  let taskId: string;
  let noteId: string;

  beforeAll(async () => {
    // Clean up all related tables
    await deleteAllRecords('lead');
    await deleteAllRecords('attachment');
    await deleteAllRecords('task');
    await deleteAllRecords('taskTarget');
    await deleteAllRecords('note');
    await deleteAllRecords('noteTarget');
    await deleteAllRecords('favorite');

    // Create a test lead for all relation tests
    const leadOperation = createManyOperationFactory({
      objectMetadataSingularName: 'lead',
      objectMetadataPluralName: 'leads',
      gqlFields: LEAD_GQL_FIELDS,
      data: [
        {
          leadNo: 'LD-202601-REL01',
          customerName: 'Relation Test Customer',
          contactNumber: {
            primaryPhoneCountryCode: '+1',
            primaryPhoneNumber: '5551111111',
            primaryPhoneCallingCode: '+1',
          },
          loanAmount: 300000,
        },
      ],
    });

    const leadResponse = await makeGraphqlAPIRequest(leadOperation);
    leadId = leadResponse.body.data.createLeads[0].id;
  });

  describe('Lead → Attachment relation', () => {
    let attachmentId: string;

    it('should create attachment linked to lead', async () => {
      const attachmentOperation = createManyOperationFactory({
        objectMetadataSingularName: 'attachment',
        objectMetadataPluralName: 'attachments',
        gqlFields: ATTACHMENT_GQL_FIELDS,
        data: [
          {
            name: 'Income Proof.pdf',
            fullPath: '/uploads/income-proof.pdf',
            type: 'Document',
            leadId: leadId,
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(attachmentOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createAttachments).toHaveLength(1);
      expect(response.body.data.createAttachments[0].name).toEqual(
        'Income Proof.pdf',
      );
      expect(response.body.data.createAttachments[0].lead).toBeDefined();
      expect(response.body.data.createAttachments[0].lead.id).toEqual(leadId);
      expect(response.body.data.createAttachments[0].lead.customerName).toEqual(
        'Relation Test Customer',
      );

      attachmentId = response.body.data.createAttachments[0].id;
    });

    it('should query lead with attachments', async () => {
      const graphqlOperation = {
        query: gql`
          query GetLeadWithAttachments($filter: LeadFilterInput!) {
            lead(filter: $filter) {
              id
              customerName
              attachments {
                edges {
                  node {
                    id
                    name
                    fullPath
                    type
                  }
                }
              }
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
      expect(response.body.data.lead.attachments.edges.length).toBeGreaterThan(
        0,
      );
      expect(response.body.data.lead.attachments.edges[0].node.id).toEqual(
        attachmentId,
      );
      expect(response.body.data.lead.attachments.edges[0].node.name).toEqual(
        'Income Proof.pdf',
      );
    });

    it('should create multiple attachments for lead', async () => {
      const attachmentOperation = createManyOperationFactory({
        objectMetadataSingularName: 'attachment',
        objectMetadataPluralName: 'attachments',
        gqlFields: ATTACHMENT_GQL_FIELDS,
        data: [
          {
            name: 'Bank Statement.pdf',
            fullPath: '/uploads/bank-statement.pdf',
            type: 'Document',
            leadId: leadId,
          },
          {
            name: 'Property Photos.jpg',
            fullPath: '/uploads/property-photos.jpg',
            type: 'Image',
            leadId: leadId,
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(attachmentOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createAttachments).toHaveLength(2);

      // Verify both are linked to the same lead
      response.body.data.createAttachments.forEach((attachment: any) => {
        expect(attachment.lead.id).toEqual(leadId);
      });
    });

    it('should query all attachments for lead', async () => {
      const graphqlOperation = {
        query: gql`
          query GetLeadWithAllAttachments($filter: LeadFilterInput!) {
            lead(filter: $filter) {
              id
              attachments {
                edges {
                  node {
                    id
                    name
                    type
                  }
                }
              }
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
      expect(response.body.data.lead.attachments.edges.length).toEqual(3);

      // Verify all attachment names
      const attachmentNames = response.body.data.lead.attachments.edges.map(
        (edge: any) => edge.node.name,
      );
      expect(attachmentNames).toContain('Income Proof.pdf');
      expect(attachmentNames).toContain('Bank Statement.pdf');
      expect(attachmentNames).toContain('Property Photos.jpg');
    });
  });

  describe('Lead → Task relation via TaskTarget', () => {
    let taskTargetId: string;

    it('should create task', async () => {
      const taskOperation = createManyOperationFactory({
        objectMetadataSingularName: 'task',
        objectMetadataPluralName: 'tasks',
        gqlFields: TASK_GQL_FIELDS,
        data: [
          {
            title: 'Review loan application',
            body: 'Review all documents and verify information',
            status: 'TODO',
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(taskOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createTasks).toHaveLength(1);
      expect(response.body.data.createTasks[0].title).toEqual(
        'Review loan application',
      );

      taskId = response.body.data.createTasks[0].id;
    });

    it('should create taskTarget linking task to lead', async () => {
      const taskTargetOperation = createManyOperationFactory({
        objectMetadataSingularName: 'taskTarget',
        objectMetadataPluralName: 'taskTargets',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        data: [
          {
            taskId: taskId,
            leadId: leadId,
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(taskTargetOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createTaskTargets).toHaveLength(1);
      expect(response.body.data.createTaskTargets[0].task).toBeDefined();
      expect(response.body.data.createTaskTargets[0].task.id).toEqual(taskId);
      expect(response.body.data.createTaskTargets[0].lead).toBeDefined();
      expect(response.body.data.createTaskTargets[0].lead.id).toEqual(leadId);

      taskTargetId = response.body.data.createTaskTargets[0].id;
    });

    it('should query lead with task targets', async () => {
      const graphqlOperation = {
        query: gql`
          query GetLeadWithTasks($filter: LeadFilterInput!) {
            lead(filter: $filter) {
              id
              customerName
              taskTargets {
                edges {
                  node {
                    id
                    task {
                      id
                      title
                      body
                      status
                    }
                  }
                }
              }
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
      expect(response.body.data.lead.taskTargets.edges.length).toBeGreaterThan(
        0,
      );
      expect(response.body.data.lead.taskTargets.edges[0].node.id).toEqual(
        taskTargetId,
      );
      expect(
        response.body.data.lead.taskTargets.edges[0].node.task.title,
      ).toEqual('Review loan application');
    });

    it('should create multiple tasks for lead', async () => {
      // Create additional tasks
      const tasksOperation = createManyOperationFactory({
        objectMetadataSingularName: 'task',
        objectMetadataPluralName: 'tasks',
        gqlFields: TASK_GQL_FIELDS,
        data: [
          {
            title: 'Call customer for verification',
            body: 'Verify contact details and employment',
            status: 'TODO',
          },
          {
            title: 'Schedule site visit',
            body: 'Visit property for valuation',
            status: 'IN_PROGRESS',
          },
        ],
      });

      const tasksResponse = await makeGraphqlAPIRequest(tasksOperation);
      const task2Id = tasksResponse.body.data.createTasks[0].id;
      const task3Id = tasksResponse.body.data.createTasks[1].id;

      // Create task targets for both tasks
      const taskTargetsOperation = createManyOperationFactory({
        objectMetadataSingularName: 'taskTarget',
        objectMetadataPluralName: 'taskTargets',
        gqlFields: TASK_TARGET_GQL_FIELDS,
        data: [
          {
            taskId: task2Id,
            leadId: leadId,
          },
          {
            taskId: task3Id,
            leadId: leadId,
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(taskTargetsOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createTaskTargets).toHaveLength(2);
    });
  });

  describe('Lead → Note relation via NoteTarget', () => {
    let noteTargetId: string;

    it('should create note', async () => {
      const noteOperation = createManyOperationFactory({
        objectMetadataSingularName: 'note',
        objectMetadataPluralName: 'notes',
        gqlFields: NOTE_GQL_FIELDS,
        data: [
          {
            title: 'Follow-up required',
            body: 'Customer requested callback on Monday 2PM',
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(noteOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createNotes).toHaveLength(1);
      expect(response.body.data.createNotes[0].title).toEqual(
        'Follow-up required',
      );

      noteId = response.body.data.createNotes[0].id;
    });

    it('should create noteTarget linking note to lead', async () => {
      const noteTargetOperation = createManyOperationFactory({
        objectMetadataSingularName: 'noteTarget',
        objectMetadataPluralName: 'noteTargets',
        gqlFields: NOTE_TARGET_GQL_FIELDS,
        data: [
          {
            noteId: noteId,
            leadId: leadId,
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(noteTargetOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createNoteTargets).toHaveLength(1);
      expect(response.body.data.createNoteTargets[0].note).toBeDefined();
      expect(response.body.data.createNoteTargets[0].note.id).toEqual(noteId);
      expect(response.body.data.createNoteTargets[0].lead).toBeDefined();
      expect(response.body.data.createNoteTargets[0].lead.id).toEqual(leadId);

      noteTargetId = response.body.data.createNoteTargets[0].id;
    });

    it('should query lead with note targets', async () => {
      const graphqlOperation = {
        query: gql`
          query GetLeadWithNotes($filter: LeadFilterInput!) {
            lead(filter: $filter) {
              id
              customerName
              noteTargets {
                edges {
                  node {
                    id
                    note {
                      id
                      title
                      body
                    }
                  }
                }
              }
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
      expect(response.body.data.lead.noteTargets.edges.length).toBeGreaterThan(
        0,
      );
      expect(response.body.data.lead.noteTargets.edges[0].node.id).toEqual(
        noteTargetId,
      );
      expect(
        response.body.data.lead.noteTargets.edges[0].node.note.title,
      ).toEqual('Follow-up required');
    });
  });

  describe('Lead → Favorite relation', () => {
    let favoriteId: string;

    it('should create favorite for lead', async () => {
      const favoriteOperation = createManyOperationFactory({
        objectMetadataSingularName: 'favorite',
        objectMetadataPluralName: 'favorites',
        gqlFields: FAVORITE_GQL_FIELDS,
        data: [
          {
            leadId: leadId,
            position: 1,
          },
        ],
      });

      const response = await makeGraphqlAPIRequest(favoriteOperation);

      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.createFavorites).toHaveLength(1);
      expect(response.body.data.createFavorites[0].lead).toBeDefined();
      expect(response.body.data.createFavorites[0].lead.id).toEqual(leadId);
      expect(response.body.data.createFavorites[0].position).toEqual(1);

      favoriteId = response.body.data.createFavorites[0].id;
    });

    it('should query lead with favorites', async () => {
      const graphqlOperation = {
        query: gql`
          query GetLeadWithFavorites($filter: LeadFilterInput!) {
            lead(filter: $filter) {
              id
              customerName
              favorites {
                edges {
                  node {
                    id
                    position
                  }
                }
              }
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
      expect(response.body.data.lead.favorites.edges.length).toBeGreaterThan(0);
      expect(response.body.data.lead.favorites.edges[0].node.id).toEqual(
        favoriteId,
      );
    });
  });

  describe('Lead → TimelineActivity relation', () => {
    it('should query timeline activities for lead', async () => {
      // TimelineActivity records are typically auto-created by the system
      // This test verifies that the relation exists and can be queried
      const graphqlOperation = {
        query: gql`
          query GetTimelineActivitiesForLead($filter: TimelineActivityFilterInput!) {
            timelineActivities(filter: $filter) {
              edges {
                node {
                  id
                  name
                  happensAt
                  targetLead {
                    id
                    customerName
                  }
                }
              }
            }
          }
        `,
        variables: {
          filter: {
            targetLeadId: { eq: leadId },
          },
        },
      };

      const response = await makeGraphqlAPIRequest(graphqlOperation);

      // Timeline activities might be empty if none were auto-created yet
      // But the query should succeed without errors
      expect(response.body.errors).toBeUndefined();
      expect(response.body.data.timelineActivities).toBeDefined();
      expect(response.body.data.timelineActivities.edges).toBeInstanceOf(Array);

      // If any activities exist, verify they're properly linked
      if (response.body.data.timelineActivities.edges.length > 0) {
        response.body.data.timelineActivities.edges.forEach((edge: any) => {
          expect(edge.node.targetLead).toBeDefined();
          expect(edge.node.targetLead.id).toEqual(leadId);
        });
      }
    });
  });

  describe('Complex query with all relations', () => {
    it('should query lead with all related entities', async () => {
      const graphqlOperation = {
        query: gql`
          query GetLeadWithAllRelations($filter: LeadFilterInput!) {
            lead(filter: $filter) {
              id
              leadNo
              customerName
              loanAmount
              
              # Attachments
              attachments {
                edges {
                  node {
                    id
                    name
                  }
                }
              }
              
              # Tasks
              taskTargets {
                edges {
                  node {
                    id
                    task {
                      id
                      title
                      status
                    }
                  }
                }
              }
              
              # Notes
              noteTargets {
                edges {
                  node {
                    id
                    note {
                      id
                      title
                    }
                  }
                }
              }
              
              # Favorites
              favorites {
                edges {
                  node {
                    id
                    position
                  }
                }
              }
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

      // Verify all relations are present
      expect(response.body.data.lead.attachments).toBeDefined();
      expect(response.body.data.lead.taskTargets).toBeDefined();
      expect(response.body.data.lead.noteTargets).toBeDefined();
      expect(response.body.data.lead.favorites).toBeDefined();

      // Verify we have data in relations
      expect(
        response.body.data.lead.attachments.edges.length,
      ).toBeGreaterThanOrEqual(3);
      expect(
        response.body.data.lead.taskTargets.edges.length,
      ).toBeGreaterThanOrEqual(3);
      expect(
        response.body.data.lead.noteTargets.edges.length,
      ).toBeGreaterThanOrEqual(1);
      expect(
        response.body.data.lead.favorites.edges.length,
      ).toBeGreaterThanOrEqual(1);
    });
  });
});
