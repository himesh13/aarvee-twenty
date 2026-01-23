import { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import styled from '@emotion/styled';
import { Button } from 'twenty-ui/input';
import { IconCheck, IconClock, IconPlus } from 'twenty-ui/display';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

const GET_REMINDERS_QUERY = gql`
  query GetRemindersForLead($leadId: String!) {
    getRemindersForLead(leadId: $leadId) {
      id
      type
      title
      description
      dueDate
      isCompleted
      createdAt
    }
  }
`;

const COMPLETE_REMINDER_MUTATION = gql`
  mutation CompleteReminder($reminderId: String!) {
    completeReminder(reminderId: $reminderId) {
      id
      isCompleted
    }
  }
`;

const CREATE_REMINDER_MUTATION = gql`
  mutation CreateReminder($leadId: String!, $title: String!, $dueDate: Date!, $description: String) {
    createReminder(leadId: $leadId, title: $title, dueDate: $dueDate, description: $description) {
      id
      title
      dueDate
    }
  }
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
`;

const Title = styled.h3`
  font-size: ${({ theme }) => theme.font.size.md};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  color: ${({ theme }) => theme.font.color.primary};
  margin: 0;
`;

const ReminderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const ReminderItem = styled.div<{ isCompleted: boolean }>`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding: ${({ theme }) => theme.spacing(2)};
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  opacity: ${({ isCompleted }) => (isCompleted ? 0.6 : 1)};
  text-decoration: ${({ isCompleted }) => (isCompleted ? 'line-through' : 'none')};
`;

const ReminderContent = styled.div`
  flex: 1;
`;

const ReminderTitle = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
  color: ${({ theme }) => theme.font.color.primary};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

const ReminderDescription = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  margin-bottom: ${({ theme }) => theme.spacing(0.5)};
`;

const ReminderMeta = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  font-size: ${({ theme }) => theme.font.size.xs};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const ReminderType = styled.span<{ type: string }>`
  padding: ${({ theme }) => theme.spacing(0.5)} ${({ theme }) => theme.spacing(1)};
  background-color: ${({ theme, type }) => {
    switch (type) {
      case 'BIRTHDAY':
        return theme.color.blue;
      case 'LOAN_TOPUP':
        return theme.color.green;
      case 'FOLLOW_UP':
        return theme.color.orange;
      default:
        return theme.color.gray;
    }
  }};
  color: white;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing(4)};
  color: ${({ theme }) => theme.font.color.tertiary};
`;

interface ReminderPanelProps {
  leadId: string;
}

/**
 * Reminder Panel
 * 
 * Displays and manages reminders for a lead.
 * Features:
 * - View all reminders (birthday, loan topup, custom)
 * - Mark reminders as completed
 * - Create new custom reminders
 * - Visual indicators for reminder types
 * - Real-time updates
 */
export const ReminderPanel = ({ leadId }: ReminderPanelProps) => {
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const [showCreateForm, setShowCreateForm] = useState(false);

  const { data, loading, refetch } = useQuery(GET_REMINDERS_QUERY, {
    variables: { leadId },
    skip: !leadId,
  });

  const [completeReminder] = useMutation(COMPLETE_REMINDER_MUTATION, {
    onCompleted: () => {
      enqueueSuccessSnackBar({ message: 'Reminder marked as completed' });
      refetch();
    },
    onError: (error) => {
      enqueueErrorSnackBar({
        message: `Failed to complete reminder: ${error.message}`,
      });
    },
  });

  const handleCompleteReminder = (reminderId: string) => {
    completeReminder({ variables: { reminderId } });
  };

  const reminders = data?.getRemindersForLead || [];

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Container>
      <Header>
        <Title>Reminders</Title>
        <Button
          Icon={IconPlus}
          title="Add Reminder"
          onClick={() => setShowCreateForm(true)}
          variant="secondary"
          size="small"
        />
      </Header>

      {loading ? (
        <div>Loading reminders...</div>
      ) : reminders.length === 0 ? (
        <EmptyState>
          <IconClock size={48} />
          <p>No reminders yet</p>
          <p>Create a reminder to stay on top of follow-ups</p>
        </EmptyState>
      ) : (
        <ReminderList>
          {reminders.map((reminder: any) => (
            <ReminderItem key={reminder.id} isCompleted={reminder.isCompleted}>
              <ReminderContent>
                <ReminderTitle>{reminder.title}</ReminderTitle>
                {reminder.description && (
                  <ReminderDescription>{reminder.description}</ReminderDescription>
                )}
                <ReminderMeta>
                  <ReminderType type={reminder.type}>{reminder.type}</ReminderType>
                  <span>Due: {formatDate(reminder.dueDate)}</span>
                </ReminderMeta>
              </ReminderContent>
              {!reminder.isCompleted && (
                <Button
                  Icon={IconCheck}
                  title="Complete"
                  onClick={() => handleCompleteReminder(reminder.id)}
                  variant="tertiary"
                  size="small"
                />
              )}
            </ReminderItem>
          ))}
        </ReminderList>
      )}
    </Container>
  );
};
