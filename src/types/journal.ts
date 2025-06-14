
export interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
}

export interface CreateJournalEntry {
  title: string;
  content: string;
  date: string;
}

export interface UpdateJournalEntry extends CreateJournalEntry {
  id: string;
}
