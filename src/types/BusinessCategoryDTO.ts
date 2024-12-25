export interface BusinessCategoryOption {
  label: string;
  value: string;
  groupName?: string; // Optional, used for grouping
  id: string; // Unique identifier for the option
}

export interface BusinessCategoryGroup {
  group: string; // The name of the group
  options: BusinessCategoryOption[]; // Array of options in this group
}

export type BusinessCategoriesDTO = (
  | BusinessCategoryOption
  | BusinessCategoryGroup
)[];
