export interface Project {
  id: string;
  name: string;
  instructions: string;
  files: string[];
  conversations: { id: string; title: string; lastMessage: string }[];
  createdAt: Date;
  updatedAt: Date;
  isStarred?: boolean;
  isArchived?: boolean; // We'll keep this in type for compatibility/migration but won't use it in UI
}
