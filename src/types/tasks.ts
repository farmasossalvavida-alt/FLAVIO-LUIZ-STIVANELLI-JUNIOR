export interface TaskItem {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  status: 'pending' | 'completed';
  isReminder?: boolean;
}
