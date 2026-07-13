import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WorkflowActions } from './workflow-actions';

// Mock the mutation hooks entirely — this test is about which buttons a given
// status/role/assignee combination renders (the actual workflow-interaction
// logic), not about React Query's plumbing, which is already covered by the
// backend's e2e and unit tests plus the Playwright runs done during development.
function fakeMutation() {
  return { mutateAsync: vi.fn(), isPending: false };
}

vi.mock('@/hooks/use-workflow', () => ({
  useStartWork: () => fakeMutation(),
  useSubmitReview: () => fakeMutation(),
  useAccept: () => fakeMutation(),
  useSendBack: () => fakeMutation(),
  useCancel: () => fakeMutation(),
  useReopen: () => fakeMutation(),
}));

describe('WorkflowActions', () => {
  it('shows nothing for an unassigned Member viewing a Backlog item', () => {
    render(
      <WorkflowActions workItemId="1" status="BACKLOG" isManager={false} isAssignee={false} />,
    );
    expect(screen.queryByText('Workflow actions')).not.toBeInTheDocument();
  });

  it('shows Start Work to the assignee on an Assigned item, and nothing to the Manager', () => {
    const { rerender } = render(
      <WorkflowActions workItemId="1" status="ASSIGNED" isManager={false} isAssignee={true} />,
    );
    expect(screen.getByRole('button', { name: 'Start Work' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();

    rerender(<WorkflowActions workItemId="1" status="ASSIGNED" isManager={true} isAssignee={false} />);
    expect(screen.queryByRole('button', { name: 'Start Work' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
  });

  it('shows Submit for Review to the assignee on an In Progress item', () => {
    render(
      <WorkflowActions workItemId="1" status="IN_PROGRESS" isManager={false} isAssignee={true} />,
    );
    expect(screen.getByRole('button', { name: 'Submit for Review' })).toBeInTheDocument();
  });

  it('shows Accept, Send Back, and Cancel to the Manager on an In Review item, nothing to a non-assignee Member', () => {
    render(
      <WorkflowActions workItemId="1" status="IN_REVIEW" isManager={true} isAssignee={false} />,
    );
    expect(screen.getByRole('button', { name: 'Accept' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Send Back' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();

    render(
      <WorkflowActions workItemId="1" status="IN_REVIEW" isManager={false} isAssignee={false} />,
    );
    expect(screen.queryAllByText('Workflow actions')).toHaveLength(1); // only the Manager render above
  });

  it('shows Reopen to the Manager on a Done or Cancelled item, and never Cancel', () => {
    for (const status of ['DONE', 'CANCELLED'] as const) {
      const { unmount } = render(
        <WorkflowActions workItemId="1" status={status} isManager={true} isAssignee={false} />,
      );
      expect(screen.getByRole('button', { name: 'Reopen' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Cancel' })).not.toBeInTheDocument();
      unmount();
    }
  });
});
