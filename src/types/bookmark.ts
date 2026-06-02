export type Bookmark = {
  id: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  user_id: string;
  created_at: string;
  category_id: string | null;
};

export type Category = {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
};
